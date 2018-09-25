import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit }   from '@angular/core';
import { ActivatedRoute, Router }  from '@angular/router';
import { Observable } from "rxjs/Observable";

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Prices } from '../../../../../both/collections/prices.collection';
import { Price } from '../../../../../both/models/price.model';

import { Item } from '../../../../../both/models/item.model';
import { Store } from '../../../../../both/models/store.model';
import { SubmitPrice } from '../../../../../both/models/submitprice.model';

import { VariablesService } from '../../services-global/VariablesService';
import { ValidatorsService } from '../../services/ValidatorService';
import { SingleCollectionService } from "../../services/SingleIdCollection.data.service";
import { SubmitpricesService } from "../submitprices-service/submitprices-service";
import { CacheStateService } from '../../services-global/CacheStateService';
import { SnackbarService } from '../../services/SnackbarService';

import template from './submitprices-create.html';

@Component({
    selector: 'submitprices-create',
    template,
})
export class SubmitpricesCreateComponent implements OnInit {
    user: Meteor.User;
    submitPriceForm: FormGroup;

    dataPrice: Observable<Price[]>;
    price: Price;
    priceId: string;

    dataItem: Observable<Item[]>;
    item: Item;

    dataStore: Observable<Store[]>;
    store: Store;
    storeList: Array<any>;

    submitprice: SubmitPrice;

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
        private _cacheState: CacheStateService,
        public _submitService: SubmitpricesService,
        public _varsService: VariablesService,
        private _validatorsService: ValidatorsService,
        private _ngZone: NgZone,
        public _data: SingleCollectionService) { }


    ngOnInit() {
        // Check if user has access
        this._snackbar.verifyUserAccess(true);

        // create activity after page has loaded to force call to ngAfterViewInit()
        let tmpObv = new Observable(observer => {
            setTimeout(() => {
                observer.next(4);
            }, 10);
        }).first();
        tmpObv.subscribe();

        // Monitor reactive Error using an Observable subject
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

            // Initialize Object outside of a subscribe first...
            this.list = {priceId: this.priceId};
            this.list['itemTitle'] = '...';
            this.list['itemImage'] = '';
            this.list['storeName'] = '...';
            this.list['storeAddress'] = '...';

            // Don't need to capture ExpireAt date.  Re-calculcate it from scratch
            this.submitPriceForm = this.formBuilder.group({
                priceId: [this.priceId, Validators.required],
                itemId: ['xx'],
                payoutRequest: [''],
                soldOut: [''],
                storeIds: ['', Validators.required],
                price: ['', [ this._validatorsService.isValidNumber, this._validatorsService.isValidPrice ]],
            });

            // Data was loaded previously - retrieve it from local collection
            this.price = Prices.findOne(this.priceId);
            console.log(this.price);


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

                    if (x[0].price == 99999.01) {
                        // Sold out
                        this.soldOut = true;
                        this.submitPriceForm.patchValue({soldOut: true, price: ''});
                    }
                    else if (x[0].price > 99999.01) {
                        this.soldOut = false;
                        this.submitPriceForm.patchValue({soldOut: false, price: ''});
                    }
                    else {
                        this.soldOut = false;
                        this.submitPriceForm.patchValue({soldOut: false, price: x[0].price});
                    }

                    this.submitPriceForm.patchValue({
                        itemId: x[0].itemId,
                        payoutRequest: x[0].payoutRequest,
                        storeIds: x[0].storeId
                    });


                    this.getItemData(undefined, x[0].itemId);
                    this.getStoreData(undefined, x[0].storeId);
                });


            }
            else {

                if (isNaN(this.price.payoutRequest)) {
                    this.price.payoutRequest = 0;
                }

                this.list['storeId'] = this.price.storeId;
                this.list['itemId'] = this.price.itemId;
                this.list['quantity'] = this.price.quantity;
                this.list['payoutRequest'] = this.price.payoutRequest;

                if (this.price.price == 99999.01) {
                    // Sold out
                    this.soldOut = true;
                    this.submitPriceForm.patchValue({soldOut: true, price: ''});
                }
                else if (this.price.price > 99999.01) {
                    this.soldOut = false;
                    // force user to enter new price, otherwise user has to cancel or select sold out
                    this.submitPriceForm.patchValue({soldOut: false, price: ''});
                }
                else {
                    this.soldOut = false;
                    this.price.price = Math.round( this.price.price * this.price.gsize * this.price.quantity * 100) / 100;
                    this.submitPriceForm.patchValue({soldOut: false, price: this.price.price});
                }

                this.submitPriceForm.patchValue({
                    itemId: this.price.itemId,
                    payoutRequest: this.price.payoutRequest,
                    storeIds: this.price.storeId
                });

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


    /**
     * 
     * @param itemName 
     * @param itemId 
     */
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

    /**
     * 
     * @param storeName 
     * @param storeId 
     */
    getStoreData(storeName, storeId) {
        // Get Store Info
        if (storeName == undefined) {
            this.dataStore = this._data.getStore(storeId).zone();
            this.dataStore.subscribe(x => {
                this.list['storeName'] = x[0].name;
                this.list['storeAddress'] = x[0].address;

                this.storeList = [];
                this.storeList.push({
                    storeId: x[0]._id,
                    name: x[0].address,
                    address: x[0].name
                });
                this.submitPriceForm.patchValue({storeIds: 'got an ID'});
            });
        }
        else {
            this.list['storeName'] = this.price.storeName;
            this.list['storeAddress'] = this.price.storeAddress;

            this.storeList = [];
            this.storeList.push({
                storeId: this.price.storeId,
                name: this.price.storeAddress,
                address: this.price.storeName
            });
            this.submitPriceForm.patchValue({storeIds: 'got an ID'});
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


    addNewSubmitPrice() {
            if (this.submitPriceForm.valid) {
                this.hide_spinner = false;
                this._snackbar.resetSnackbar();
                
                let currentDate = new Date().getTime();

                // If this a new Price, status and note fields will be overridden in server method
                let sp = <SubmitPrice>{};
                sp.priceId = this.submitPriceForm.value.priceId;
                sp.itemId = this.submitPriceForm.value.itemId;
                sp.price = parseFloat(this.submitPriceForm.value.price);
                sp.payout = parseInt(this.submitPriceForm.value.payoutRequest);
                sp.soldOut = this.submitPriceForm.value.soldOut;
                sp.note = 'submit-new';

                // If this is a new Price, note field will be set in server method, otherwise Price object will be ignored
                let p = <Price>{};
                p.itemId = this.submitPriceForm.value.itemId;
                p.payoutRequest = 0;
                p.updated = currentDate;
                p.expiresAt = 111;
                p.quantity = this.list['quantity'];
                p.price = parseFloat(this.submitPriceForm.value.price);
                p.soldOut = this.submitPriceForm.value.soldOut;

                this.combined$ = this._submitService.submitpricesInsertPriceX(p, sp, this.storeList);
                this.combined$.subscribe(x => {
                    this._ngZone.run(() => { // run inside Angular2 world
                        this._cacheState.apolloRefetchCacheDel(['sp-submitted', 'rq-active', 'rq-received']);
                        this.errors['error'] =   this._varsService.errors['errors'];

                        if (this.errors['error']) {
                            this._varsService.setReactiveError();
                            this.hide_spinner = true;
                            return;                                                
                        }
                        else {
                            this.router.navigate(['/sp']);
                            console.warn("SUCCESSFULLY INSERTED ALL NEW SUBMIT PRICE... " );
                            return;                        
                        }
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

