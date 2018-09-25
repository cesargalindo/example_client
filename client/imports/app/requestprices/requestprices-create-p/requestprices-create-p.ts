import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute }  from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Router }  from '@angular/router';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Item } from '../../../../../both/models/item.model';
import { Price } from '../../../../../both/models/price.model';
import { RequestPrice } from '../../../../../both/models/requestprice.model';
import { SliderSettings } from '../../../../../both/models/helper.models';

import { VariablesService } from '../../services-global/VariablesService';
import { SingleCollectionService } from "../../services/SingleIdCollection.data.service";
import { SnackbarService } from '../../services/SnackbarService';
import { UserService } from '../../services-global/UserService';
import { CacheStateService } from '../../services-global/CacheStateService';

import { RequestpricesService } from "../requestprices-service/requestprices-service";

import template from './requestprices-create-p.html';

/**
 * Logic is similar to requestnew-item except that item already exist
 *
 */
@Component({
    selector: 'requestprices-create-p',
    template,

})
export class RequestpricesCreatePComponent implements OnInit {
    requestNewPriceForm: FormGroup;

    storeList: Array<any>;

    thumb_image: string;
    no_image_thumb: string;

    hide_spinner: boolean = false;

    item: Object;
    dataItem: Observable<Item[]>;

    store_Error: boolean = false;

    errors: Object;
    msgs: Object;

    ssObj: SliderSettings;
    enableQuantity: boolean = true;

    request$: Observable<any[]>;
    
    constructor(
        public _snackbar: SnackbarService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router,
        private _cacheState: CacheStateService,
        public _varsService: VariablesService,
        public _userService: UserService,
        public _requestService: RequestpricesService,
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

        this.no_image_thumb = Meteor.settings.public.GOOGLE_IMAGE_PATH  + Meteor.settings.public.GOOGLE_IMAGE_THUMB + 'no/' + Meteor.settings.public.GOOGLE_NO_IMAGE;
        this._varsService.resetFormErrorVairables();
        this.errors = this._varsService.errors;
        this.msgs = this._varsService.msgs;

        this.storeList = [];
        this.item = { };

        this.requestNewPriceForm = this.formBuilder.group({
            storeIds: ['', Validators.required]
        });

        // Update form with values if editing
        this.route.params.subscribe((params) => {

            console.log("^^^^^^^^ BUILD FORM NOW ^^^^^^^^^ " + params['itemId']);
            if (params['itemId']) {

                this.item['id'] = params['itemId'];
                this.dataItem = this._data.getItem(params['itemId']).zone();
                this.dataItem.subscribe(x => {
                    console.log('########### ngOnInit - route.params.subscribe ########### ' +  x[0].name + ' -- ' + x[0].image + ' -- ' + x[0].size);
                    this.item['name'] = x[0].name;
                    this.item['image'] = x[0].image;
                    this.item['size'] = x[0].size;
                    
                    if (x[0].image) {
                        console.log(x[0].image.includes("amazonaws"));
                        if ( x[0].image.includes("amazonaws") ) {
                            // image is on AWS - change to thumb path
                            this.thumb_image = x[0].image.replace( Meteor.settings.public.AWS_IMAGE_DEFAULT, Meteor.settings.public.AWS_IMAGE_THUMB);
                        }
                        else {
                            // then it's on Google - change to thumb path
                            this.thumb_image = x[0].image.replace( Meteor.settings.public.GOOGLE_IMAGE_DEFAULT, Meteor.settings.public.GOOGLE_IMAGE_THUMB);
                        }
                    }
                    else {
                        this.thumb_image = this.no_image_thumb;
                    }

                });
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
     * Input from search-stores
     * storeIds value only used to validate if storeIds field is empty or not
     * Actual storeId values are pulled from this.storeList
     *
     * @param storeInfo
     */
    storeListChanged(storeInfo) {
        this.storeList = storeInfo;

        if (_.size( this.storeList) ) {
            console.log("changed - storeList ID = " + storeInfo[0].storeId);
            this.requestNewPriceForm.patchValue({storeIds: 'got an ID'});
        }
        else {
            console.log('changed... storeList is EMPTY= 0');
            this.requestNewPriceForm.patchValue({storeIds: ''});
        }
    }


    /**
     * Input from request1-slider
     *
     */
    sliderDataChanged(sliderInfo: SliderSettings) {
        this.ssObj = sliderInfo;
    }


    /**
     * Add newly Requested Price for selected Quantity, Item, Store
    */
    addNewRequestPrice() {
        if (this.requestNewPriceForm.valid) {

            this.hide_spinner = false;
            this._snackbar.resetSnackbar();

            let p = <Price>{};
            p.itemId = this.item['id'];
            // p.payoutRequest = rp.payRequest;     // add this in service
            // p.updated = currentDate;             // add this in service
            // p.expiresAt = rp.expiresAt;          // add this in service
            p.quantity = parseInt(this.ssObj.quantityDefault);

            this.request$ = this._requestService.addNewRequestPrice(p, this.storeList);

            this.request$.subscribe(x => {
                // this._ngZone.run(() => { // run inside Angular2 world
                    console.warn(x);
                    this.hide_spinner = true;
            
                    if ( (x.status == undefined) || (x.status) ) {
                        // this._snackbar.displaySnackbar(4);
                        this._cacheState.forceFullsearchRerun();               
                        this._cacheState.apolloRefetchCacheDel(['rq-active', 'rq-received', 'rq-rejected', 'rq-closed']);   
                        this.router.navigate(['/landing']);
                    }
                    else {
                        if ( x.id == undefined ) {
                            this._snackbar.displaySnackbar(1); 
                        }
                        else {
                            this._snackbar.displaySnackbar(x.id);
                        }
                    }
                // });            
            });
        }
        else {
            // Only check required for storeIds - value is outputted to Search stores component
            if (this.requestNewPriceForm.controls.storeIds._status == 'INVALID') {
                this.store_Error = true;
            }
            else {
                this.store_Error = false;
            }
            return;
        }

    }

}

