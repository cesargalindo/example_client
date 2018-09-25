import { Meteor } from 'meteor/meteor';

import { SubmitPrice } from '../../both/models/submitprice.model';

import { Prices } from '../../both/collections/prices.collection';
import { Price } from '../../both/models/price.model';

import { Items } from '../../both/collections/items.collection';
import { Item } from '../../both/models/item.model';

import { masterValidator, infoModel } from '../functions/functions.client.misc';
import { itemsUpdate, itemsUpdateElasticsearch } from '../functions/functions.client.items';
import { submitpricesInsertNewprice, submitpricesInsertUpdateprice, startQueueSubmitProcess } from '../functions/functions.client.submitprices';

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
     * Simplied submit for item update from users who down vote
     * 
     * @param itemId 
     * @param name 
     * @param size 
     * @param unit 
     */
    'simplified.item.update'(itemId: string, name: string, size: number, unit: string) {
        // Verify user of Client App is logged in
        if (this.userId) {
            check(itemId, String);
            check(name, String);
            check(size, Number);
            check(unit, String);
            
            let it = Items.find({
                _id: itemId
            }).fetch();

            // Item exist in system
            if (it.length) {

                let i = <Item>{};
                i._id = itemId;
                i.name = name,
                i.size = size,
                i.unit = unit,
                i.note = 'simplified-update';
                
                let itemRes = itemsUpdate(i);
                console.log(itemRes);

                if (itemRes.status) {
                    return itemsUpdateElasticsearch(i);
                }
                else {
                    return ({
                        status: false,
                        error: 'ERROR: unable to update item'
                    });   
                }

            }
        }
    },


    /**
     * Simplied submit for price update from users who down vote
     * 
     * @param priceId 
     * @param price 
     * @param soldOut 
     */
    'simplified.price.submit'(priceId: string, price: number, soldOut: boolean) {
        // Verify user of Client App is logged in
        if (this.userId) {
            check(priceId, String);
            check(price, Number);
            check(soldOut, Boolean);
            
            let pr = Prices.find({
                _id: priceId
            }).fetch();

            // Price exist in system
            if (pr.length) {

                let currentDate = new Date().getTime();

                // If this a new Price, status and note fields will be overridden in server method
                let sp = <SubmitPrice>{};
                sp.priceId = priceId;
                sp.itemId = pr[0].itemId;
                sp.storeId = pr[0].storeId;;
                if (soldOut) {
                    // Sold out
                    sp.price = 99999.01;
                }
                else {
                    sp.price = price;               
                }
                sp.payout = pr[0].payoutRequest;
                sp.soldOut = soldOut;                
                sp.note = 'submit-new';
                sp.owner = this.userId;
                sp.status = -1;

                return startQueueSubmitProcess(sp);
            }
        }
    },

    
    /**
     * sp.note is required
     * sp.note must equal 'submit-new' - only option
     * sp.status will be overriden by function calls within this method
     *
     */
    'submitprices.insert.price.x'(p: Price, sp: SubmitPrice, storeId: string, info: infoModel) {
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
        check(sp, {
            priceId: Match.Maybe(String),
            itemId: String,
            price: Number,
            payout: Number,
            soldOut: Boolean,
            // status: Number,
            note: String,
            owner:  Match.Maybe(String)
        });
        check(storeId, String);

        // If Client called, initialize info object
        if (info == undefined) {
            info = new infoModel('', '', '', '', '', '', '');
            info.check2 = 'submit';     // check submitStatus
        }
        else {
            check(info, {
                userId: String,
                adminKey: String,
                ownerId: String,
                collection: Match.Maybe(String),
                id: Match.Maybe(String)
            });
        }

        info.conn = this.connection;
        info.collection = 'skip';
        let res = masterValidator(info);                            

        // Requestprice is not active yet, thus there's no need to check for Race conditions
        if (res.status) {

            if (sp.note == 'submit-new') {
                sp.status = -1
            }
            else {
                return {
                    status: false,
                    error: 'Unkown status detected.'
                }
            }

            // Meteor.userId() can only be invoked in method calls. Use this.userId in publish functions
            let owner = this.userId;
            p.submitterId = owner;

            // DDP call
            if (res.callFrom == 'ddp') {

                // confirm we are not getting back an empty owner
                if (info.ownerId == '') {
                    console.error('#####################################################')
                    console.error('######## ERROR: EMPTY OWNER in submitprices.insert.price.x ##############')
                    console.error('#####################################################')
                }

                owner = info.ownerId;
                sp.owner = owner;
                p.submitterId = owner;
            }

            // Create our future instance.
            let RPfuture = new Future();

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
                    if (results.data.apPriceQuantity) {
                        sp.priceId = results.data.apPriceQuantity._id;
                        let spUP = submitpricesInsertUpdateprice(sp, storeId, owner);
                        RPfuture.return(spUP);
                    }
                    else {
                        // Insert new Price - it doesn't exist
                        let spRIP = submitpricesInsertNewprice(p, sp, storeId, owner);
                        RPfuture.return(spRIP);
                    }

                }).catch((error) => {
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


});





