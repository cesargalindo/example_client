import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit }   from '@angular/core';
import { ActivatedRoute, Router }  from '@angular/router';
import { Observable } from "rxjs/Observable";

import { FormGroup, FormBuilder } from '@angular/forms';

import { Prices } from '../../../../../both/collections/prices.collection';
import { Price } from '../../../../../both/models/price.model';

import { Item } from '../../../../../both/models/item.model';
import { Store } from '../../../../../both/models/store.model';
import { SubmitPrice } from '../../../../../both/models/submitprice.model';
import { RequestPriceProcess } from "../../../../../both/models/helper.models";

import { VariablesService } from '../../services-global/VariablesService';
import { ValidatorsService } from '../../services/ValidatorService';
import { SingleCollectionService } from "../../services/SingleIdCollection.data.service";
import { SubmitpricesService } from "../submitprices-service/submitprices-service";
import { CacheStateService } from '../../services-global/CacheStateService';

import { SnackbarService } from '../../services/SnackbarService';

import template from './submitprices-reject.html';

@Component({
    selector: 'submitprices-reject',
    template,
})
export class SubmitpricesRejectComponent implements OnInit {
    user: Meteor.User;
    submitPriceForm: FormGroup;

    dataPrice: Observable<Price[]>;
    price: Price;
    priceId: string;
    spId: string;
    rpId: string;

    dataItem: Observable<Item[]>;
    item: Item;

    dataStore: Observable<Store[]>;

    submitprice: SubmitPrice;
    submittedPrice: number;

    list:Object;
    soldOut: boolean;

    hide_spinner: boolean = false;

    labels: Object;
    errors: Object;
    msgs: Object;

    private combined$: Observable<any[]>;

    constructor(
        public _snackbar: SnackbarService,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        public _submitService: SubmitpricesService,
        public _varsService: VariablesService,
        private _validatorsService: ValidatorsService,
        private _ngZone: NgZone,
        private _cacheState: CacheStateService,
        public _data: SingleCollectionService) { }


    ngOnInit() {
        // Check if user has access
        this._snackbar.verifyUserAccess(true);

        // Monitor reactiveLogin using an Observable subject
        let reactiveError  =  this._varsService.getReactiveError();
        reactiveError.subscribe(x => {
            this._ngZone.run(() => { // run inside Angular2 world
                if (x) {
                    this.hide_spinner = true;
                    this._snackbar.displaySnackbar(1);

                }
            });
        });

        this.labels = this._varsService.labels;
        this.errors = this._varsService.errors;
        this.msgs = this._varsService.msgs;

        this.route.params.subscribe((params) => {
            this.priceId = params['priceId'];
            this.spId = params['spId'];
            this.rpId = params['rpId'];
            this.submittedPrice = parseFloat(params['price']);

            // Initialize Object outside of a subscribe first...
            this.list = {priceId: this.priceId};
            this.list['itemTitle'] = '...';
            this.list['itemImage'] = '';
            this.list['storeName'] = '...';
            this.list['storeAddress'] = '...';

            // Don't need to capture ExpireAt date.  Re-calculcate it from scratch
            this.submitPriceForm = this.formBuilder.group({
                soldOut: [''],
                price: ['', [ this._validatorsService.isValidNumber, this._validatorsService.isValidPrice ]],
            });

            // Data was loaded previously - retrieve it from local collection
            this.price = Prices.findOne(this.priceId);

            if (this.price == undefined) {
                this.dataPrice = this._data.getPrice(this.priceId).zone();
                this.dataPrice.subscribe(x => {

                    if (isNaN(x[0].payoutRequest)) {
                        x[0].payoutRequest = 0;
                    }

                    this.list['storeId'] = x[0].storeId;
                    this.list['itemId'] = x[0].itemId;
                    this.list['quantity'] = x[0].quantity;
                    this.list['payoutRequest'] = x[0].payoutRequest;

                    // Clear submit form, enforce user to enter new price
                    this.submitPriceForm.patchValue({soldOut: false, price: ''});

                    this.getItemData(undefined, x[0].itemId);
                    this.getStoreData(undefined, x[0].storeId);
                });
            }
            else {
                if (isNaN(this.price.payoutRequest)) {
                    // payoutRequest should already exist, it should never be undefined
                    return;
                }

                this.list['storeId'] = this.price.storeId;
                this.list['itemId'] = this.price.itemId;
                this.list['quantity'] = this.price.quantity;
                this.list['payoutRequest'] = this.price.payoutRequest;

                // Clear submit form, enforce user to enter new price
                this.submitPriceForm.patchValue({soldOut: false, price: ''});

                // Get Item and store Info
                this.getItemData(this.price.itemName, this.price.itemId);
                this.getStoreData(this.price.storeName, this.price.storeId);
            }

        });

        this.hide_spinner = true;                
    }


    /**
     * Hide top toolbar to allow buttons to be shown on top
     */
    ngAfterViewInit() {
        this._varsService.setReactiveHideToolbar(true);
    }


    getItemData(itemName, itemId) {
        // Get Item Info
        if (itemName == undefined) {
            this.dataItem = this._data.getItem(itemId).zone();
            this.dataItem.subscribe(x => {
                this.list['itemTitle'] = x[0].name;
                this.list['itemImage'] = x[0].image;
            });
        }
        else {
            this.list['itemTitle'] = this.price.itemName;
            this.list['itemImage'] = this.price.itemImage;
        }
    }


    getStoreData(storeName, storeId) {
        // Get Store Info
        if (storeName == undefined) {
            this.dataStore = this._data.getStore(storeId).zone();
            this.dataStore.subscribe(x => {
                this.list['storeName'] = x[0].name;
                this.list['storeAddress'] = x[0].address;
            });
        }
        else {
            this.list['storeName'] = this.price.storeName;
            this.list['storeAddress'] = this.price.storeAddress;
        }
    }


    clickSoldOut() {
        this.soldOut =  this.submitPriceForm.value.soldOut;

        if (this.submitPriceForm.value.soldOut) {
            // Actualy value doesn't matter - it will be overwritten based on soldOut field
            this.submitPriceForm.patchValue({price: '999'});
        }
        else {
            this.submitPriceForm.patchValue({price: ''});
        }

    }


    /**
     * Rejecter must provide a new price
     * 1) Update submit price with new price
     * 2) Reject original Requestprice
     *
     */
    RejectAddNewSubmitPrice() {

        if (this.submitPriceForm.valid) {
            this.hide_spinner = false;
            this._snackbar.resetSnackbar();
            let currentDate = new Date().getTime();
            
            let sp = <SubmitPrice>{};
            sp.priceId = this.priceId;
            sp.itemId = this.list['itemId'];
            sp.price = parseFloat(this.submitPriceForm.value.price);
            sp.payout =  this.list['payoutRequest'];
            sp.soldOut = this.submitPriceForm.value.soldOut;
            sp.note = 'submit-new';

            let p = <Price>{};
            p.itemId = this.list['itemId'];
            p.payoutRequest = 0;
            p.updated = currentDate;
            p.expiresAt = 111;
            p.quantity = this.list['quantity'];
            p.price = parseFloat(this.submitPriceForm.value.price);
            p.soldOut = this.submitPriceForm.value.soldOut;
            p.note = 'insert-new-sp';

            let storeArray = [];
            storeArray.push({
                storeId: this.list['storeId']
            });

            // Insert new price first
            this.combined$ = this._submitService.submitpricesInsertPriceX(p, sp, storeArray);
            this.combined$.subscribe(x => {
                this.errors['error'] =  this._varsService.errors['errors'];
                if (this.errors['error']) {
                    this._cacheState.apolloRefetchCacheDel(['sp-submitted']);
                    this._varsService.setReactiveError();
                    return;
                }

                // new Submitprice inserted - proceed with price rejection
                let rpObject = new RequestPriceProcess();
                rpObject.id = this.rpId;
                rpObject.spId = this.spId;
                rpObject.price = p.price;

                Meteor.call('requestpricesQueue.reject', rpObject, (err, res) => {
                    this._ngZone.run(() => { // run inside Angular2 world
                        if (err) {
                            this.hide_spinner = true;                        
                            console.error("!!!!!!!! GO AN ERROR ON: RejectSubmittedPrice..... !!!!!!!!!");
                            console.error(err);
                            this.errors['error'] = err;
                            this._varsService.setReactiveError();
                            return;
                        }
                        else {
                            if (!res.status) {
                                this.hide_spinner = true;                            
                                console.error('RejectSubmittedPrice...RequestPrices  spId= ' + this.spId + ' - ' + res.error);
                                this.errors['error'] =  res.error;
                                this._varsService.setReactiveError();
                                return;
                            }
                            else {
                                console.log('success -- cancelled request price - ' + this.spId);
                                this._cacheState.apolloRefetchCacheDel(['sp-submitted', 'rq-rejected', 'rq-received']);
                                this.router.navigate(['/rqreceived']);
                            }
                        }
                    });                        
                });

            });

        }
        else {
            // Process Form Errors
            let validateFields = {};
            validateFields['price'] = 1;
            this.errors = this._varsService.processFormControlErrors(this.submitPriceForm.controls, validateFields);

            // We have an error, stay on form...
            return;
        }

    }


}

