import { Meteor } from 'meteor/meteor';
import { Price } from '../../both/models/price.model';
import { Item } from '../../both/models/item.model';
import { RequestPrice } from '../../both/models/requestprice.model';

import { pricesUpdate, pricesInsert } from '../functions/functions.client.prices';
import { itemsUpdate, itemsInsert } from '../functions/functions.client.items';
import { requestPricesUpdate, requestpricesQueueCancel, requestpricesQueueUpdate, requestpricesInsertSkipQueue, requestpricesInsertUpdateprice, requestpricesInsertNewprice} from '../functions/functions.client.requestprices';
import { masterValidator, checkLedgerBalance, infoModel } from '../functions/functions.client.misc';

import { RequestPriceProcess } from '../../both/models/helper.models';
let Future = Npm.require( 'fibers/future' );

// Apolo Config
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import gql from 'graphql-tag';

let fetch = require('node-fetch');
global.fetch = fetch;

// Create Apollo Client
const networkInterface = createNetworkInterface({
    uri: Meteor.settings.public.GRAPHQL_URL,
    headers: {
        'Content-type': "application/json"
    }
});

let client = new ApolloClient({
    networkInterface
});

// Construct Apollo GrapQL Queries
const checkPriceQuantity = gql`
    query PriceQuantityCheck($storeId: String, $itemId: String, $quantity: Int) {
        apPriceQuantity(storeId: $storeId, itemId: $itemId, quantity: $quantity) {
            _id
            storeId
        }
    }
`;



Meteor.methods({

    /** 
     * rp.note is required
     * only options for note allowed is when rp.note = 'request-new'
     * function calls below will override status as needed
     * 
     * @param p 
     * @param rp 
     * @param storeId 
     * @param info 
     */
    'requestprices.insert.price.x'(p: Price, rp: RequestPrice, storeId: string, info: infoModel) {
        check(p, {
            itemId: String,
            payoutRequest: Number,
            updated: Number,
            expiresAt: Number,
            quantity: Match.Maybe(Number),
            price: Match.Maybe(Number),
            soldOut: Match.Maybe(Boolean),
            note: Match.Maybe(String)
        });
        check(rp, {
            priceId: Match.Maybe(String),
            itemId: String,
            payRequest: Number,
            expiresAt: Number,
            updated: Number,
            // status: Number,
            note: String
        });
        check(storeId, String);

        // If Client called, initialize info object
        if (info == undefined) {
            info = new infoModel('', '', '', '', '', '', '');
            info.check2 = 'request';     // check requestStatus
        }
        else {
            check(info, {
                userId: String,
                adminKey: String,
                ownerId: String,
                collection: Match.Maybe(String),
                id: Match.Maybe(String),
            });
        }
        info.conn = this.connection;
        info.collection = 'skip';
        let res = masterValidator(info);    

        // Requestprice is not active yet, thus there's no need to check for Race conditions
        if (res.status) {

            if (rp.note == 'request-new') {
                rp.status = -1
            }
            else {
                return {
                    status: false,
                    error: 'Unkown status detected.'
                }
            }

            // Create our future instance.
            let RPfuture = new Future();

            // Meteor.userId() can only be invoked in method calls. Use this.userId in publish functions
            let owner = this.userId;
            p.submitterId = owner;

            // DDP call
            if (res.callFrom == 'ddp') {

                // confirm we are not getting back an empty owner
                if (info.ownerId == '') {
                    console.error('#####################################################')
                    console.error('######## ERROR: EMPTY OWNER in requestprices.insert.price.x ##############')
                    console.error('#####################################################')
                }

                owner = info.ownerId;
                rp.owner = owner;
                p.submitterId = owner;
            }

            client.query({
                query: checkPriceQuantity,
                forceFetch: true,
                variables: {
                    storeId: storeId,
                    itemId: p.itemId,
                    quantity: p.quantity
                }
            })
                .then((results) => {
                    console.warn(results.data.apPriceQuantity);
                    console.warn('==========requestprices.insert.price.x============= ' + _.size(results.data.apPriceQuantity) + ' storeId = ' + storeId);

                    if (results.data.apPriceQuantity) {
                        rp.priceId = results.data.apPriceQuantity._id;
                        let resRUP = requestpricesInsertUpdateprice(rp, storeId, owner, res.callFrom);

                        console.warn('==========requestprices.insert.price.x============= 2222  storeId = ' + storeId);

                        RPfuture.return(resRUP);
                    }
                    else {
                        // ss - Insert new Price - it doesn't exist
                        let resRIP = requestpricesInsertNewprice(p, rp, storeId, owner, res.callFrom);

                        console.warn('==========requestprices.insert.price.x============= 4444  storeId = ' + storeId);

                        RPfuture.return(resRIP);
                    }

                }).catch((error) => {
                    console.log('there was an error sending apPriceQuantity query', error);
                    RPfuture.return({
                        status: false,
                        error: 'There was an error sending PQ query.'
                    });
                });

            // Got error or looped through all stores, return status
            return RPfuture.wait();
        }
        else {
            return res;
        }

    },


    /**
     * Cancel Requestprice
     * 
     * @param rp 
     * @param info 
     */
    'requestprices.cancel'(rp, info: infoModel) {
        check(rp, {
            _id: String,
            priceId: String,
            itemId: Match.Maybe(String),
            note: String,
            owner: Match.Maybe(String),
        });

        // If Client called, initialize info object
        if (info == undefined) {
            info = new infoModel('', '', '', '', '', '', '');
            info.check2 = 'request';     // check requestStatus
        }
        else {
            check(info, {
                userId: String,
                adminKey: String,
                ownerId: String,
                collection: Match.Maybe(String),
                id: Match.Maybe(String),
            });
        }
        info.conn = this.connection;
        info.collection = 'rp';
        info.ownerId = rp.owner;
        info.id = rp._id;
        let res = masterValidator(info);                             

        if (res.status) {
            // This Requestprice is not active, users are not allowed to submit a price on it, thus there's no race condition
            if ( (rp.note == 'cancel-new') && (res.xstatus == 9)) {
                // Cancel newly requested price request - update associated item and price entity

                rp.updated = new Date().getTime();
                rp.status = 4;
                let requestRes = requestPricesUpdate(rp);           
                console.log(requestRes);

                let pu = <Price>{};
                pu._id = rp.priceId;
                pu.note = rp.note;
                pu.updated = rp.updated;
                let priceRes = pricesUpdate(pu);                    
                console.log(priceRes);


                let i = <Item>{};
                i._id = rp.itemId;
                i.note = rp.note;
                let itemRes = itemsUpdate(i);
                console.log(itemRes);

                // TODO - in the future explore converting this to sync if demanded?
                return ({status: true});
            }
            else {
                let rpObject = new RequestPriceProcess();
                rpObject.id = rp._id;
                rpObject.priceId = rp.priceId;

                // DDP call
                if (res.callFrom == 'ddp') {
                    rpObject.userId =  info.userId;
                }
                else {
                    rpObject.userId = this.userId;        // validate this userId when updating
                }

                rpObject.note = rp.note;
                //async calls (parent method is sync)
                return requestpricesQueueCancel(rpObject);      
            }
        }
        else {
            return res;
        }

    },


    /**
     * Update existing item, price, and requestPrice
     * All these function calls are async
     *
     * @param i 
     * @param p 
     * @param rp 
     * @param info 
     */
    'requestprices.edit.price.item'(i: Item, p: Price, rp: RequestPrice, info: infoModel) {
        check(i, {
            _id: String,
            name: String,
            size: String,
            image: String,
            public: Match.Maybe(Number),
            category: Match.Maybe(String),
            note: Match.Maybe(String)
        });
        check(p, {
            _id: String,
            payoutRequest: Number,
            updated: Number,
            expiresAt: Number,
            quantity: Number,
            note: Match.Maybe(String)
        });
        check(rp, {
            _id: String,
            payRequest: Number,
            expiresAt: Number,
            updated: Number,
            requestedAt: Number,
            note: String,
            owner: Match.Maybe(String),
        });

        // If Client called, initialize info object
        if (info == undefined) {
            info = new infoModel('', '', '', '', '', '', '');
        }
        else {
            check(info, {
                userId: String,
                adminKey: String,
                ownerId: String,
                collection: Match.Maybe(String),
                id: Match.Maybe(String),
            });
        }
        info.conn = this.connection;
        info.collection = 'rp';
        info.ownerId = rp.owner;
        info.id = rp._id;
        let res = masterValidator(info);                         

        // Requestprice is not active yet, thus there's no need to check for Race conditions
        if (res.status) {
            // Ensure user has sufficient funds
            let bc = checkLedgerBalance(rp, res.callFrom);
            if (!bc.status) {
                return bc;
            }

            let requestRes = requestPricesUpdate(rp);    
            if (requestRes.status) {

                let priceRes = pricesUpdate(p);       

                if (priceRes.status) {
                    return itemsUpdate(i);        
                }
                else {
                    return priceRes;
                }

            }
            else {
                return requestRes;
            }
        }
        else {
            return res;
        }

    },


    /**
     * Updated exsting Requestprice
     * 
     * @param rp 
     * @param info 
     */
    'requestprices.update'(rp: RequestPrice, info: infoModel) {
        check(rp, {
            _id: String,
            priceId: Match.Maybe(String),
            payRequest: Number,
            expiresAt: Number,
            updated: Number,
            status: Match.Maybe(Number),
            note: String,
            owner: Match.Maybe(String),
        });

        // If Client called, initialize info object
        if (info == undefined) {
            info = new infoModel('', '', '', '', '', '', '');
            info.check2 = 'request';     // check requestStatus
        }
        else {
            check(info, {
                userId: String,
                adminKey: String,
                ownerId: String,
                collection: Match.Maybe(String),
                id: Match.Maybe(String),
            });
        }
        info.conn = this.connection;
        info.collection = 'rp';
        info.ownerId = rp.owner;
        info.id = rp._id;

        let res = masterValidator(info);           
        if (res.status) {
            // Ensure user has sufficient funds
            let bc = checkLedgerBalance(rp, res.callFrom);
            if (!bc.status) {
                return bc;
            }

            if (rp.note == 'update-new') {
                rp.requestedAt = rp.updated;

                // TODO - in the future explore converting this to sync if demanded?
                requestPricesUpdate(rp);                                     
                return ({status: true});
            }
            else {

                let rpObject = new RequestPriceProcess();
                rpObject.id = rp._id;

                // DDP call
                if (res.callFrom == 'ddp') {
                    rpObject.userId = info.ownerId;
                }
                else {
                    rpObject.userId = this.userId;
                }

                rpObject.payRequest = rp.payRequest;
                rpObject.updated = rp.updated;
                rpObject.expiresAt = rp.expiresAt;
                rpObject.note = rp.note;

                console.log('**** 666666 ====> requestpricesQueueUpdate');
                console.log(rpObject);

                return requestpricesQueueUpdate(rpObject);           
            }
        }
        else {
            return res;
        }

    },


});


