import { Meteor } from 'meteor/meteor';
import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Prices } from '../../../../both/collections/prices.collection';
import { Price } from '../../../../both/models/price.model';

import { ElasticSearchService } from '../services/ElasticSearchService';

import { Snapshots } from '../../../../both/collections/snapshots.local.collection';
import { snapshot } from '../../../../both/models/snapshot.model';
import { SearchQuery_name, SearchQuery_filter } from '../../../../both/models/helper.models';
import { ElasticParams } from '../../../../both/models/helper.models';

import { CacheStateService } from '../services-global/CacheStateService';
import { LocationTrackingService } from '../services-global/LocationTrackingService';
import { SearchHistoryService } from '../services-global/SearchHistoryService';
import { RequestpricesService } from "../requestprices/requestprices-service/requestprices-service";
import { SnackbarService } from '../services/SnackbarService';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Angular2Apollo, ApolloQueryObservable } from 'angular2-apollo';
import gql from 'graphql-tag';

import template from './elasticsearch-ss2.html';

@Component({
    selector: 'elasticsearch-ss2',
    template,
    inputs: ['selectedItem'],
})
export class ElasticSearchSS2Component implements OnInit, OnDestroy  {
    prices: Observable<Price[]>;
    private pricesSub: Subscription;

    subStores: Observable<any>;         // Retrieve through Apollo
    subPrices: Observable<any>;
    combined$: Observable<any[]>;

    request$: Observable<any[]>;

    items_ss2: Observable<Array<Object>>;
    apolloStores: ApolloQueryObservable<any>;

    elasticParams: ElasticParams = <ElasticParams>{};

    public clearField = '';
    public queryName = '';
    public hideResults = false;

    queryTotal: number = 7;

    getPriceIds: Array<any>;
    pricesData: Array<any>;
    distances: Array<any>;

    storeIds: Array<any>;

    snapshot : snapshot;

    searchResults: number;
    clickedItemId: string;

    searchQuery_name: SearchQuery_name;
    searchQuery_filter: SearchQuery_filter;

    itemsArray: Object;
    storesArray: Object;
    requestPricesArray: Object;
    no_image: string;

    newPriceEnteryType: string;

    pricesInfoOutput: any = [];

    toggleMe: Object = {};

    // @input selectedItem - is passed to us from landing-page to us
    selectedItem: Object;

    hideRequest: Object = {};
    priceUpdatedTime: number;
    display_spinner: boolean = false;
    
    thumbsUps: Object = {};

    itemName: string;
    itemSize: string;
    itemImage: string;

    constructor(
        public _snackbar: SnackbarService,        
        public _requestService: RequestpricesService,        
        private elasticsearch: ElasticSearchService,
        private _cacheState: CacheStateService,
        private apollo: Angular2Apollo,
        private _ngZone: NgZone,        
        private _locationTrackingService: LocationTrackingService,
        public _searchHistory: SearchHistoryService,
        private router: Router) { }


    /**
     * Capture input emits()
     *
     */
    ngOnChanges(changes) {
        this.elasticParams.lat = 1;

        console.log('debug ---- ngOnChanges called ------ ');

        this.hideResults = true;
        this.clearField = '';

        this.storesArray = { };
        this.itemsArray = { };

        // s6s-A - selectedItem is passed from landing-page
        if (this.selectedItem != undefined) {

            // reset prices - display spinner
            this.prices = Prices.find({
                _id: 'bogus'
            });
            this.display_spinner = true; 

            this.queryName = this.selectedItem.name;

            // searchQuery_name was just saved before ngOnChanges was called 
            // data in (changes) is a subset of data in searchQuery_name 
            // ss1Gunit value is not yet in this.selectedItem.ss1Gunit so grab from history
            this.searchQuery_name = this._searchHistory.getHistory('searchQuery_name');

            // record item in item search history
            if (this.selectedItem.id == undefined) {
                this._searchHistory.addItem("items", { id: null, name: this.selectedItem.name, gunit: this.searchQuery_name.ss1Gunit });
            }
            else {
                this._searchHistory.addItem("items", { id: this.selectedItem.id, name: this.selectedItem.name, gunit: this.searchQuery_name.ss1Gunit });
            }

            if(this.selectedItem.id == undefined) {
                this.elasticSearch_ss2_process(null, this.selectedItem.name, this.searchQuery_name.ss1Gunit );
            }
            else {
                this.elasticSearch_ss2_process(this.selectedItem.id, null, this.searchQuery_name.ss1Gunit );
            }
        }
    }


    ngOnInit() {
        this.priceUpdatedTime = new Date().getTime() - (1000 * 60 * 60 * 4);

        this.no_image = Meteor.settings.public.GOOGLE_IMAGE_PATH  + Meteor.settings.public.GOOGLE_IMAGE_DEFAULT + 'no/' + Meteor.settings.public.GOOGLE_NO_IMAGE;

        this.storesArray = { };
        this.itemsArray = { };

        this.searchQuery_name = this._searchHistory.getHistory('searchQuery_name');

        MeteorObservable.autorun().subscribe(() => {

            // Handle Tracker autorun change
            // since I wrapped this Snapshot "Meteor" collection around an autorun() => {  .... });
            // Snapshots collection is reactive - every time it's updated while on landing page, this code will run
            this.snapshot = Snapshots.findOne('REQUEST-SEARCH-SETTINGS');

            this.searchQuery_name = this._searchHistory.getHistory('searchQuery_name');
            this.queryName = this.searchQuery_name.name;

            if (this.snapshot.reRunSearch) {

                Snapshots.update('REQUEST-SEARCH-SETTINGS', {
                    $set: {
                        'reRunSearch': false,
                    }
                });

                // Angular4 hosed Change Detection - force a click to rerun search
                Meteor.setTimeout(function () {
                    document.getElementById('forcererunbyclick').click();
                }, 50);
            }
        });

        // reset prices - display spinner        
        this.prices = Prices.find({
            _id: 'bogus'
        });
        this.display_spinner = true; 

        /**
         * If page was redirected from another page - rerun existing search
         */
        if (this.searchQuery_name.searchEntry == 'enter') {
            if (this.searchQuery_name.name) {
                this.elasticSearch_ss2_process(null, this.searchQuery_name.name, this.searchQuery_name.ss1Gunit);
                return;
            }
        }
        else if (this.searchQuery_name.searchEntry == 'select') {
            if (this.searchQuery_name.id) {
                this.elasticSearch_ss2_process(this.searchQuery_name.id, null, this.searchQuery_name.ss1Gunit);
                return;
            }
        }
        else {
            this.searchResults = 99;  
            this.display_spinner = false;
        }
    }


    /**
     * called when reRunSearch = true
     */
    elasticSearch_ss2_rerun() {
        // reset prices - display spinner                
        this.prices = Prices.find({
            _id: 'bogus'
        });
        this.display_spinner = true;        
    

        if (this.searchQuery_name.searchEntry == 'enter') {
            if (this.searchQuery_name.name) {
                this.elasticSearch_ss2_process(null, this.searchQuery_name.name, this.searchQuery_name.ss1Gunit);
            }
        }
        else if (this.searchQuery_name.searchEntry == 'select') {
            if (this.searchQuery_name.id) {
                this.elasticSearch_ss2_process(this.searchQuery_name.id, null, this.searchQuery_name.ss1Gunit);
            }
        }
    }


    /**
     * 1) Return list of priceIds from Elasticsearch
     * 2) Then retrieve corresponding data for Prices, Items, and Stores
     *      - Prices information is always retrieved on client using Meteor subscription
     *              - the allows UI to be reactive for price information
     *      - Items info is always retrieved in server
     *      - Store data is retrieved in client if search term is a name
     *          - to avoid making multiple calls on server, can call on client async with prices call
     *      - Store data is retrieved in server if search term is an itemId
     * 
     * 
     * searchResults:
     *   99 - hide "Request price at different store" while processing
     *   0  - results found, display them
     *   1  - no results found - filter is applied - ask user to modify filter
     *   2  - no results found for search term - location set to all - feel free to add item
     *   3  - no results found for selected item - location set to all 
     *              - feel free to request or submit price  OR
     *              - change location
     *   5  - search is bypassed - a request or submit caused a new price collection entry - display Thank You message
     * 
     */
    elasticSearch_ss2_process(itemId, name, ss1Gunit) {
        
        this.searchResults = 0;
        
        if (this._cacheState.checkNewPriceEntryInserted()) {
            this.searchResults = 5;
            this.newPriceEnteryType = this._cacheState.checkNewPriceEntryType();

            this._cacheState.setNewPriceEntryInserted(false, null);     
            this.display_spinner = false;            
            return;
        }


        // Get latest coordinates
        this.getCoordinates();

        this.elasticParams.itemId = itemId;
        this.elasticParams.name = name;

        // If user hits enter key before ss1 results have been returned, use "ct" as default settings
        // note - ss1Gunit is not used on "enter key" searches
        if (ss1Gunit == undefined) {
            this.elasticParams.ss1Gunit = 'ct';
        }
        else {
            this.elasticParams.ss1Gunit = ss1Gunit;            
        }    

        if (this.searchQuery_name.ss1New == undefined) {
            this.elasticParams.ss1New = true;            
        }
        else {
            this.elasticParams.ss1New = this.searchQuery_name.ss1New;            
        }
    
        this.searchQuery_filter = this._searchHistory.getHistory("searchQuery_filter");
        this.elasticParams.operator  = this.searchQuery_filter.operator;
        
        // Set quantity to 1 - user can change it later when he/she request or submits a new non-existing price
        this.elasticParams.quantity = 1; 
        this.elasticParams.size  = this.searchQuery_filter.size;
        this.elasticParams.unit = this.searchQuery_filter.unit;

        // alert(itemId + ' -- ' + name + ' -ss1- ' + ss1Gunit + ' -- ' + this.searchQuery_filter.operator + ' -- ' + this.elasticParams.size + ' -- ' + this.elasticParams.unit );

        let searchInfoC = this._searchHistory.getHistory("searchQuery_type");
        this.elasticParams.searchType = searchInfoC.searchType;

        // Single store serach is no longer supported
        this.elasticParams.storeId = '';

        this.elasticParams.limit = this.queryTotal;

        this.items_ss2 = this.elasticsearch.elasticSearch_ss2(this.elasticParams);
        
        this.items_ss2
            .subscribe(res => {
                // console.warn(res.prices);

                if (_.size(res.prices) == 0) {
                    this.clickedItemId = itemId;

                    // check if filter is applied
                    if (this.searchQuery_filter.operator != 'all') {
                        this.searchResults = 1;                        
                    }
                    // called on ngOnInit - page load
                    else if (_.isEmpty(this.selectedItem)) {
                        // If user clicked Cancel button on Add New Item page
                        this.selectedItem = {
                            id: itemId
                        };

                        // Place link on bottom of page for Add New                     
                        if (this.searchQuery_name.searchEntry == 'enter') {
                            this.searchResults = 2;
                        }
                        // place buttons for Request/Submit new price page    
                        else if (this.searchQuery_name.searchEntry == 'select') {
                            this.searchResults = 3;
                        }
                    }
                    else if (this.selectedItem.id == undefined) {
                        // Place link on bottom of page for Add New   
                        this.searchResults = 2;
                    }
                    else {
                        // place buttons for Request/Submit new price page   
                        this.searchResults = 3;
                    }

                    this.display_spinner = false;                
                    return;
                }


                // Get itemIds, retrieved using Apollo - reactivity is not needed since Item info doesn't change
                this.itemsArray = res.items;
                let keys = _.keys(res.items);
                this.clickedItemId = keys[0];

                // update search query history - set ss1New = false, and return gunit of first item   
                // Set query to search by ItemId 'select' - so when you changes filter it doesn't pick up a different item          
                let gInfo = this.elasticsearch.getGlobalSize(1, res.items[this.clickedItemId].unit);
                let restrictTo = 'count';

                // Get restrict filter values
                if (gInfo.gunit == "oz") {
                    restrictTo = 'weight';
                }
                else if (gInfo.gunit == "fl oz") {
                    restrictTo = 'volume';   
                }

                this._searchHistory.addItem("searchQuery_name", {
                    name: this.searchQuery_name.name,
                    id: this.clickedItemId,
                    searchEntry: 'select',
                    ss1Gunit: gInfo.gunit,
                    ss1New: false
                });

                // restrict filter options
                this._searchHistory.addItem("searchQuery_filter", {
                    operator: this.searchQuery_filter.operator,
                    size: this.searchQuery_filter.size,
                    unit: this.searchQuery_filter.unit,
                    restrictTo: restrictTo
                });

                // Get storeIds, retrieved using Apollo - reactivity is not needed since Store info doesn't change
                let waitForStores = 0;
                if (_.size(res.stores)) {
                    this.storesArray = res.stores;
                }
                else {
                    waitForStores = 1;
                    this.storeIds = _.uniq(res.prices.map(x => x.store));

                    let serializedStoreIds = JSON.stringify(this.storeIds);

                    this.subStores = new Observable.create(observer => {

                        this.apolloStores = this.apollo.query({
                            query: gql`
                            query StoresInfoQuery($serializedIds: String) {
                                apStoresByIds(serializedIds: $serializedIds) {
                                    _id
                                    name
                                    address
                                    locationT {
                                        lat
                                        lng
                                    }
                                }
                            }
                            `,
                                    variables: {
                                        serializedIds: serializedStoreIds
                                    }
                                })
                                    .subscribe(({data}) => {
                                        this.storesArray = _.indexBy(data.apStoresByIds, '_id');
                                        observer.next(this.storesArray);
                                        observer.complete();
                                    });
                            });
                }

                // Get RequestPrices, data retrieved using Apollo
                this.requestPricesArray = res.requestPrices;

                // Get distances, Get PriceIds, then subscribe to Prices collection using Meteor pub/sub to ensure reactivity
                this.distances = [];
                res.prices.map(x => {
                    this.distances[x.price] = x.sort[1];
                    console.log('distance = ' + x.price + ' -- ' + x.sort[1]);
                });

                // extract priceIds into priceIds array
                this.getPriceIds = res.prices.map(x => {
                    return x.price;
                });

                this.pricesSub = MeteorObservable.subscribe('pricesArray', this.getPriceIds).zone().subscribe();

                // Set a flag to executed logic when Prices collection is updated reactively
                let pricesReactivelyUpdated = false;

                this.subPrices = new Observable.create(observer => {

                    let cnt = 1;
                    Prices.find(
                        {_id: {$in: this.getPriceIds}},
                    )
                        .subscribe(y => {
                            // surpassed count of prices "saved in mini mongo" - thus, server response with new data has been returned to client
                            if (cnt >= this.getPriceIds.length) {

                                // When prices are reactively updated, re-calculate hideRequest values
                                if (pricesReactivelyUpdated) {
                                    y.map(z => {
                                        // If priceId existed in requestPricesArray, re-calculate status
                                        // We only care about user submit "Requested to New" and cron expire "Requested to Button enabled"
                                        if (this.requestPricesArray[z._id]) {
                                            if (z.submittedAt > this.priceUpdatedTime) {
                                                // New
                                                this.hideRequest[z._id] = -1;
                                            }
                                            // It's possible cron expired this Requestprice too, beside a user price submit
                                            else if (z.note == 'cron_run') {
                                                // Button: Request Price
                                                this.hideRequest[z._id] = 0;
                                            }
                                        }
                                    });
                                }

                                observer.next(y);
                                observer.complete();
                            }
                            cnt++;
                        });
                });


                if (waitForStores) {
                    // Combine Stores and Prices into one Observable
                    this.combined$ = Observable.combineLatest(this.subPrices, this.subStores);
                    this.combined$.subscribe(z => {
                        pricesReactivelyUpdated = true;
                        this.processPrices();
                    });
                }
                else {
                    this.subPrices.subscribe(z => {
                        pricesReactivelyUpdated = true;
                        this.processPrices();
                    })
                }

            });
    }


    /**
     * Called when count for Item, Stores, and Prices are received from server...
     *
     */
    processPrices() {
        if (!this.getPriceIds.length) {
            this.display_spinner = false;
            return;
        }
        else {

            this.itemName = '';

            // Load prices into this.prices collection and sort by Prices to ensure collection exist when processing down below - I believe it also aids in reactivity
            this.prices = Prices.find(
                {_id: {$in: this.getPriceIds}},
                {sort: {price: 1}}
            );

            // Prices should have been loaded in mini-mongo before this point is reached
            this.pricesData = Prices.find({
                _id: {$in: this.getPriceIds}
            }).fetch();

            console.log('debug - pricesData.length === ' + this.pricesData.length);

            let cnt = 0;
            this.pricesInfoOutput = [];
            // include item info, store info, and distance

            this.pricesData.map(y => {
                console.log(cnt + ' -yy- ' + y._id + ' -yy- ' + this.distances[y._id] + ' -yy- ' + y.itemId + ' -yy- ' + this.storesArray[y.storeId].name + ' -yy- ' + this.itemsArray[y.itemId].name + ' -- ');
                
                this.toggleMe[y._id] = 1;
                this.prices.collection._docs._map[y._id].distance = this.distances[y._id];

                this.prices.collection._docs._map[y._id].storeName = this.storesArray[y.storeId].name;
                let storeAddress = this.storesArray[y.storeId].address.split(",");
                this.prices.collection._docs._map[y._id].storeAddress = storeAddress[0];
                this.prices.collection._docs._map[y._id].storeCityState = storeAddress[1] + ', ' + storeAddress[2];
                this.prices.collection._docs._map[y._id].lat = this.storesArray[y.storeId].locationT.lat;
                this.prices.collection._docs._map[y._id].lng = this.storesArray[y.storeId].locationT.lng;

                // Collect data for Google Maps
                this.pricesInfoOutput.push({
                    storeName: this.storesArray[y.storeId].name,
                    itemName: this.itemsArray[y.itemId].name,
                    lat: this.storesArray[y.storeId].locationT.lat,
                    lng: this.storesArray[y.storeId].locationT.lng,
                    latitude: this.storesArray[y.storeId].locationT.lat,
                    longitude: this.storesArray[y.storeId].locationT.lng
                });

                if (this.itemName == '') {
                    this.itemName = this.itemsArray[y.itemId].name;
                
                    if (this.itemsArray[y.itemId].unit == 'ct') {
                        this.itemSize = '';
                    }
                    else {
                        this.itemSize = this.itemsArray[y.itemId].size + ' ' + this.itemsArray[y.itemId].unit;
                    }

                    // use quantity listed on Price entity - quantity on item is always = 1
                    
                    if (this.itemsArray[y.itemId].image == '') {
                        this.itemImage = this.no_image;
                    }
                    else {
                        this.itemImage = this.itemsArray[y.itemId].image;
                    }
                }

                this.prices.collection._docs._map[y._id].distance = this.distances[y._id];

                // Hide Request Prices button if user already has an active Request Prices on this item
                // If price was updated within the last 12 hours "priceUpdatedTime", mark price as new;
                if (this.requestPricesArray[y._id]) {
                    // Requested
                    this.hideRequest[y._id] = 1;
                }
                else if (y.price == 99999.06) {
                    // Button: Request Price
                    this.hideRequest[y._id] = 0;
                }
                else if (y.updated > this.priceUpdatedTime) {
                    // New
                    this.hideRequest[y._id] = -1;
                }
                else {
                    // Button: Request Price
                    this.hideRequest[y._id] = 0;
                }

                this.thumbsUps[y._id] = 0;

                cnt++;
            });

            this.display_spinner = false;
        }
    }


    quickRequest(p) {
        
        this.request$ = this._requestService.addNewRequestPrice(p, []);
        
        this.request$.subscribe(x => {
            this._ngZone.run(() => { // run inside Angular2 world
                console.warn(x);
                if ( (x.status == undefined) || (x.status) ) {
                    this.hideRequest[p._id] = 1;         
                    this._snackbar.displaySnackbar(4);
                    this._cacheState.forceFullsearchRerun();
                    this._cacheState.apolloRefetchCacheDel(['rq-active', 'rq-received', 'rq-rejected', 'rq-closed']);   
                }
                else {
                    if ( x.id == undefined ) {
                        this._snackbar.displaySnackbar(1); 
                    }
                    else {
                        this._snackbar.displaySnackbar(x.id);
                    }
                }
            });            
        });


    }
     
    createPricesRequestPrices(itemId) {
        this.router.navigate(['/requestprices-p', { itemId: itemId }]);
    }


    createPricesSubmitPrices(itemId) {
        this.router.navigate(['/submitprices-p', { itemId: itemId, redirect: '/landing' }]);
    }


    gotoInfo() {
        this.router.navigate(['/info']);
    }

    toggleMeFunc(x) {
        if (this.toggleMe[x]) {
            this.toggleMe[x] = 0;
        }
        else {
            this.toggleMe[x] = 1;
        }
    }

    thumbsUpClick(priceId) {
        alert('coming soon... :) ');
    }


    /**
     * Retrieve lat on lon from lastKnownPosition or customPosition
     *
     */
    getCoordinates() {
        let loc = this._locationTrackingService.getLocation();

        if (loc.defaultToCustom) {
            this.elasticParams.lat = loc.customPosition.latitude;
            this.elasticParams.lng = loc.customPosition.longitude;
        }
        else {
            this.elasticParams.lat = loc.lastKnownPosition.latitude;
            this.elasticParams.lng = loc.lastKnownPosition.longitude;
        }
    }

    /**
     * Angular4 hosed up a good Change Detection - force a click to workaround
     */
    forceRerunbyClick() {
        this.elasticSearch_ss2_rerun();
    }


    /**
     * Unsubscribe is not working - TODO - will need to resolve before production release...
     */
    ngOnDestroy() {
        if (this.pricesSub != undefined) {
            this.pricesSub.unsubscribe();
        }
    }

}
