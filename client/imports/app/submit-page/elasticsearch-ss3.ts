import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Prices } from '../../../../both/collections/prices.collection';
import { Price } from '../../../../both/models/price.model';

import { Snapshots } from '../../../../both/collections/snapshots.local.collection';
import { snapshot } from '../../../../both/models/snapshot.model';
import { ElasticParams } from '../../../../both/models/helper.models';

import { VariablesService } from '../services-global/VariablesService';
import { CacheStateService } from '../services-global/CacheStateService';
import { SnackbarService } from '../services/SnackbarService';
import { ElasticSearchService } from '../services/ElasticSearchService';
import { SearchHistoryService } from '../services-global/SearchHistoryService';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';

import template from './elasticsearch-ss3.html';

/**
 * Server method "ss3_Search" will search for items matching StoreId
 * lat, lng coordinates are ignored by "ss3_Search"
 *
 */
@Component({
    selector: 'elasticsearch-ss3',
    template
})
export class ElasticSearchSS3Component implements OnInit, OnDestroy  {
    submit_ss: string = 'SUBMIT-SEARCH-SETTINGS';

    queryScroll: boolean = false;  // used to retrieve queries part 3 of 3 during ngScroll or Sort
    queryScroll1: boolean = false;
    queryScroll2: boolean = false;

    prices: Observable<Price[]>;
    pricesSub: Subscription;
    timerSub: Subscription;

    subPrices: Observable<any>;
    combined$: Observable<any[]>;

    items_ss3: Observable<Array<Object>>;

    public clearField = '';

    queryTotal: number = 30;
    queryStart: number = 10;

    priceIds: Array = [];  // assign it to [] so it not undefined
    getPriceIds: Array<any>;
    pricesData: Array<any>;
    distances: Array<any>;

    snapshot : snapshot;
    elasticParams: ElasticParams = <ElasticParams>{};

    searchResults: number;
    clickedItemId: string;

    itemsArray: Object;
    storesArray: Object;
    no_image: string;

    display_spinner: boolean = false;

    /**
     *   @input selectedItem - is passed to us from landing-page to us
     *   @input reRunSearch - is passed from search-submit-settings to landing-page to us
     */

    hideme: Object = {};

    constructor(
        public _snackbar: SnackbarService,
        public _varsService: VariablesService,
        private elasticsearch: ElasticSearchService,
        public _searchHistory: SearchHistoryService,
        private _cacheState: CacheStateService) { }


    ngOnInit() {
        this.no_image = Meteor.settings.public.GOOGLE_IMAGE_PATH  + Meteor.settings.public.GOOGLE_IMAGE_DEFAULT + 'no/' + Meteor.settings.public.GOOGLE_NO_IMAGE;

        this.storesArray = { };
        this.itemsArray = { };

        MeteorObservable.autorun().subscribe(() => {
            // Handle Tracker autorun change
            // since I wrapped this Snapshot "Meteor" collection around an autorun() => {  .... });
            // Snapshots collection is reactive - every time it's updated while on landing page, this code will run
            this.snapshot = Snapshots.findOne(this.submit_ss);
            
            if (this.snapshot.reRunSearch) {

                Snapshots.update(this.submit_ss, {
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

        this.display_spinner = true;        
        this.elasticSearch_ss3_process(null, null);

        // To ensure we reactively capture any new Requestprices added to this store, rerun search
        // Re-fetch data after 75 seconds after page load, then periodically every 60 seconds
        // Using take() only execute 30 times = 30 minutes max, user should have visited another page by then
        // let timer = Observable.timer(15000, 10000);
        let timer = Observable.timer(75000, 60000);
        this.timerSub =  timer.take(30).subscribe( t =>  {
            console.warn('Count: ' +  t + ' -- TIMER waited 60 seconds, re-run search now...');
            this.elasticSearch_ss3_rerun();
        });
    }


    /**
     * called when this.reRunSearch = true
     */
    elasticSearch_ss3_rerun() {
        this.prices = Prices.find({
            _id: 'bogus'
        });

        this.display_spinner = true;

        this.elasticSearch_ss3_process(null, null);
    }


    /**
     * 1) Return list of priceIds from Elasticsearch
     * 2) Then retrieve corresponding data for Prices, Items, and Stores
     *
     */
    elasticSearch_ss3_process(itemId, name) {
        // Restrict search if user is not verified
        if (!this._snackbar.verifyUserAccess(false)) {
            this.queryTotal = 8;
            this.queryStart = 6;
        }

        this.elasticParams.itemId = '';
        this.elasticParams.name = 'provide bogus name for now - not used in ss3_Search';
        this.elasticParams.searchType = 'Store';
        this.elasticParams.limit = this.queryTotal;

        // these params are not used in search
        this.elasticParams.operator  = 'all';
        this.elasticParams.quantity = 1;
        this.elasticParams.lat = 0;
        this.elasticParams.lng = 0;

        let searchD = this._searchHistory.getHistory("searchQuery_store");
        this.elasticParams.storeId = searchD.storeId;
        if (searchD.storeId == undefined) {
            return;
        }

        this.items_ss3 = this.elasticsearch.elasticSearch_ss3(this.elasticParams);

        this.items_ss3
            .subscribe(res => {

                this.searchResults = 0;
                
                if (_.size(res.prices) == 0) {

                    this.searchResults =  1;
                    this.clickedItemId = itemId;

                    this.prices = Prices.find({
                        _id: 'bogus'
                    });

                    return res.prices;
                }

                // Get itemIds, then retrieve all store data for this search using Apollo - reactivity is not needed since Item info doesn't change
                this.itemsArray = res.items;

                // Get storeIds, then retrieve all store data for this search using Apollo - reactivity is not needed since Store info doesn't change
                this.storesArray = res.stores;

                // Get distances, Get PriceIds, then subscribe to Prices collection using Meteor pub/sub to ensure reactivity
                this.distances = [];
                // capture distances...
                res.prices.map(x => {
                    this.distances[x.price] = x.sort[0];
                    console.log('distance = ' +  x.price + ' -- ' +  x.sort[0] );
                });

                // extract priceIds into priceIds array
                this.priceIds = res.prices.map(x => {
                    return x.price;
                });

                // se slice instead of splice - slice creates a new array
                this.getPriceIds = this.priceIds.slice(0, this.queryStart);

                // confirm we have more than 10 prices - if yes, allow ngScroll
                if (this.priceIds.length > ( 1 * this.queryStart) ) {
                    this.queryScroll = true;
                }

                // If we have less than 20 prices - disable ngScroll 2
                if (this.priceIds.length <= ( 2 * this.queryStart) ) {
                    this.queryScroll2 = true;
                }

                this.pricesSub = MeteorObservable.subscribe('pricesArray', this.getPriceIds).zone().subscribe();

                this.subPrices = new Observable.create(observer => {
                    let cnt = 1;
                    Prices.find({
                        _id: { $in: this.getPriceIds}
                    })
                        .subscribe(x => {
                            // surpassed count of prices "saved in mini mongo" - thus, server response with new data has been returned to client
                            if (cnt >= this.getPriceIds.length) {
                                observer.next(x);
                                observer.complete();
                            }

                            cnt++;
                        });
                });

                // Subscript to prices - process after receiving price info from server
                this.subPrices.subscribe(z => {
                    this.processPrices();
                })

            });                    


    }


    /**
     * Called when count for Item, Stores, and Prices are received from server...
     *
     */
    processPrices() {
        console.log(this.queryScroll + ' -RRRR- ' + this.queryScroll1 + ' -RRRR- ' + this.queryScroll2);

        if (!this.priceIds.length) {
            this.display_spinner = false;            
            return;
        }
        else {

            // Load prices into this.prices collection and sort by expiresAt to ensure collection exist when processing down below - I believe it also aides reactivity
            this.prices = Prices.find(
                {_id: {$in: this.getPriceIds}, payoutRequest: { $gt: 0 } },
                { sort: { expiresAt: 1 }}
            );

            // Prices should have been loaded in mini-mongo before this point is reached
            this.pricesData = Prices.find({
                _id: {$in: this.getPriceIds}
            }).fetch();


            console.log('this.pricesData.length === ' + this.pricesData.length);

            let cnt = 0;
            // include item info, store info, and distance

            this.pricesData.map(y => {

                if (this.hideme[y._id] != -1) {
                    this.hideme[y._id] = 1;
                }

                this.prices.collection._docs._map[y._id].distance = this.distances[y._id];

                this.prices.collection._docs._map[y._id].storeName = this.storesArray[y.storeId].name;

                let storeAddress = this.storesArray[y.storeId].address.split(",");
                this.prices.collection._docs._map[y._id].storeAddress = storeAddress[0];
                this.prices.collection._docs._map[y._id].storeCityState = storeAddress[1] + ', ' + storeAddress[2];

                this.prices.collection._docs._map[y._id].itemName = this.itemsArray[y.itemId].name;
                this.prices.collection._docs._map[y._id].itemSize = this.itemsArray[y.itemId].size;

                // use quantity listed on Price entity - quantity on item is always = 1
                if (this.itemsArray[y.itemId].image == '') {
                    this.prices.collection._docs._map[y._id].itemImage = this.no_image;
                }
                else {
                    this.prices.collection._docs._map[y._id].itemImage = this.itemsArray[y.itemId].image;
                }
                cnt++;
            });

            this.display_spinner = false;            
        }
    }


    retrievePricesSimplifiedCursor(idsBatch) {
        if (idsBatch == 2) {
            if (this.priceIds.length > this.queryStart) {
                this.getPriceIds = this.priceIds.slice(0, (2 * this.queryStart));
            }
        }
        else if (idsBatch == 3) {
            // Retrieve part 3 of 3 of prices if they exist... -- only run once
            if ( (this.priceIds.length > (2 * this.queryStart)) && (this.queryScroll) ) {
                this.getPriceIds = this.priceIds;
                this.queryScroll = false;
            }
        }


        if (this.getPriceIds.length) {

            // Re-subscribe to "pricesArray" with new set of PriceIds
            this.pricesSub = MeteorObservable.subscribe('pricesArray', this.getPriceIds).zone().subscribe();
            let cnt = 1;
            let promise = new Promise((resolve) => {

                Prices.find({
                    _id: { $in: this.getPriceIds}
                })
                    .subscribe(x => {

                        if (cnt >= this.getPriceIds.length) {
                            resolve('price complete');
                        }

                        cnt++;
                    });

            });

            promise.then(result => {
                this.processPrices();
            });
        };

    }


    loadMoreItems() {
        // Check if user has access - restrict query on server side
        this._snackbar.verifyUserAccess(true);

        if (!this.queryScroll1) {
            this.queryScroll1 = true;
            this.retrievePricesSimplifiedCursor(2);

        }
        else if (!this.queryScroll2) {
            this.queryScroll2 = true;
            this.retrievePricesSimplifiedCursor(3);
        }
        else {
            this.queryScroll = false;
        }
    }


    /**
     * Angular4 hosed up a good Change Detection - force a click to workaround
     */
    forceRerunbyClick() {
        this.elasticSearch_ss3_rerun();
    }


    /**
     * unsubscribe is not working - TODO - will need to resolve before production release...
     */
    ngOnDestroy() {
        if (this.pricesSub != undefined) {
            this.pricesSub.unsubscribe();
        }

        if (this.timerSub != undefined) {
            this.timerSub.unsubscribe();
        }
    }

}
