import { Meteor } from 'meteor/meteor';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";

import { Prices } from '../../../../../both/collections/prices.collection';
import { Price } from '../../../../../both/models/price.model';

import { RequestPrice } from '../../../../../both/models/requestprice.model';

import { VariablesService } from '../../services-global/VariablesService';
import { SingleCollectionService } from "../../services/SingleIdCollection.data.service";
import { UserService } from '../../services-global/UserService';
import { CacheStateService } from '../../services-global/CacheStateService';


/**
 * Logic is similar to requestnew-item except that item already exist
 *
 */
@Injectable()
export class RequestpricesService {

    requestObvs: Object = {};
    combined$: Observable<any[]>;

    storeList: Array<any>;

    // Set to 1 cents
    payRequest: number = 1;
    // Set default request duration to 12 hours
    expiresAt: number = 1000 * 60 * 60 * 12;

    constructor(
        private _cacheState: CacheStateService,        
        public _userService: UserService,                
        public _data: SingleCollectionService,        
        public _varsService: VariablesService) { }


    /**
     *
     */
    addNewRequestPrice(price: Price, sList: Array<any>) {

        // Ensure user has requests > 0
        if (this._userService.userRequests) {
            
            let currentDate = new Date().getTime();
            
            let p = <Price>{};
            // p._id = price._id;       // server will confirm itemId, StoreId, and Quantity match
            p.itemId = price.itemId;
            p.quantity = price.quantity;
            p.updated = currentDate;
            
            // hardcode these values
            p.payoutRequest = 1;
            p.expiresAt = currentDate + this.expiresAt;

            if (sList.length) {
                this.storeList = sList;                
            }
            else if (price.storeId != undefined) {
                this.storeList = [];
                this.storeList.push({
                    storeId: price.storeId,
                });
            }
            else {
                return Observable.of({ status: false, error: 'Invalid store selection.' });                
            }

            // If this a new Requestprice, status and note fields will be overridden in server method
            let rp = <RequestPrice>{};
            rp.priceId = price._id;
            rp.itemId = price.itemId;
            rp.payRequest = p.payoutRequest;
            rp.updated = currentDate;
            rp.expiresAt = p.expiresAt;
            rp.note = 'request-new';

            return this.requestpricesInsertPriceX(p, rp, this.storeList);
        }
        else {
            return Observable.of({ status: false, id: 5, error: 'You have run out of requests.' });
        }
    }


    /**
     *
     * Add new Price and Requestprice for selected Quantity, Item, Store
     * Confirm Price doesn't exist
     *
     * If we have multiple storeIds - p and rp contain the latest storeId within all scopes - async issue
     * Therefor, we need to pass in storeId  (keep storeId separate)
     */
    requestpricesInsertPriceX(p: Price, rp: RequestPrice, storeList: Array) {

        this._varsService.errors['errors'] = '';
        // this._varsService.errors['errors'] = 'Force error message to display';

        if (storeList.length > 5) {

            return new Observable.create(observer => {
                this._varsService.errors['errors'] = this._varsService.msgs['max_store_error'];

                observer.next({
                    status: false,
                    error: this._varsService.msgs['max_store_error']

            });
                observer.complete();
            });
        }
        
        let cnt = 0;
        storeList.map(x => {

            console.warn('>>======= requestpricesInsertPriceX =======> ' + cnt + ' ---- ' + storeList.length + ' -- ' + x.storeId);

            this.requestObvs[cnt] = new Observable.create(observer => {

                Meteor.call('requestprices.insert.price.x', p, rp, x.storeId, (err, res) => {
                    if (err) {
                        this._varsService.errors['errors'] = err;
                        console.error("!!!!!!!! ERROR ON: requestprices.insert.price.x ..... !!!!!!!!!");

                        observer.next({
                            status: false,
                            error: err
                        });
                        observer.complete();

                    }
                    else {
                        if (!res.status) {
                            this._varsService.errors['errors'] = res.error;
                            console.error('requestprices.insert.price.x - ' + res.error);
                            observer.next(res);
                            observer.complete();
                        }
                        else {
                            // success!
                            observer.next(res);
                            observer.complete();
                        }
                    }
                });
            });

            cnt++;
        });


        if (storeList.length == 1) {
            this.combined$ = this.requestObvs[0];
        }
        else if (storeList.length == 2) {
            this.combined$ = Observable.combineLatest(this.requestObvs[0], this.requestObvs[1]);
        }
        else if (storeList.length == 3) {
            this.combined$ = Observable.combineLatest(this.requestObvs[0], this.requestObvs[1], this.requestObvs[2]);
        }
        else if (storeList.length == 4) {
            this.combined$ = Observable.combineLatest(this.requestObvs[0], this.requestObvs[1], this.requestObvs[2], this.requestObvs[3]);
        }
        else if (storeList.length == 5) {
            this.combined$ = Observable.combineLatest(this.requestObvs[0], this.requestObvs[1], this.requestObvs[2], this.requestObvs[3], this.requestObvs[4]);
        }

        return this.combined$;
    }




}

