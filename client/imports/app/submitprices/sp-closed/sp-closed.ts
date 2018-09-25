import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit } from '@angular/core';
import { Router }  from '@angular/router';
import { Angular2Apollo, ApolloQueryObservable } from 'angular2-apollo';

import { CacheStateService } from '../../services-global/CacheStateService';
import { VariablesService } from '../../services-global/VariablesService';
import { SnackbarService } from '../../services/SnackbarService';

import gql from 'graphql-tag';

import template from "./sp-closed.html";

@Component({
    selector: 'sp-closed',
    template,
})
export class SPClosedComponent implements OnInit {
    apolloSubmitprices3: ApolloQueryObservable<any>;
    apolloSubmitpricesCount3: ApolloQueryObservable<any>;
    apolloSubmitpricesSum3: ApolloQueryObservable<any>;

    total: number = 0;
    payoutSum: number = 0;
    payoutCount: number = 0;
    forceFetch: boolean;

    pageSize: number = 8;
    p: number = 1;
    dateOrder: number = -1;

    status: number = 5;

    currentDate: number;

    display_spinner: boolean = true;

    constructor(
        public _snackbar: SnackbarService,
        public _varsService: VariablesService,
        private apollo: Angular2Apollo,
        private router: Router,
        private _cacheState: CacheStateService,
        private _ngZone: NgZone) { }

    ngOnInit() {
        // Check if user has access
        this._snackbar.verifyUserAccess(true);

        // Hide top toolbar to allow buttons to be shown on top
        this._varsService.setReactiveHideToolbar(true);


        // Monitor reactiveLogin using an Observable subject
        let reactiveError  =  this._varsService.getReactiveError();
        reactiveError.subscribe(x => {
            this._ngZone.run(() => { // run inside Angular2 world
                if (x) {
                    this._snackbar.displaySnackbar(1);

                }
            });
        });

        // Check if time to refetch from Apollo
        this.forceFetch = this._cacheState.apolloRefetchCacheGet('sp-closed');

        // Load Requestprices Count -- it should always return before Requestprices data
        let owner = Meteor.userId();
        this.apolloSubmitpricesCount3 = this.apollo.watchQuery({
            query: gql`
                query SubmitpricesCount3($ownerId: String, $status: Int) {
                  apSubmitpricesCount(ownerId: $ownerId, status: $status) {
                    count
                  }
                }
              `,
            variables: {
                ownerId: owner,
                status: this.status
            },
            forceFetch: this.forceFetch
        })
            .map( x => {
                console.warn('######## THE COUNT ####### ' +  x.data.apSubmitpricesCount.count);
                // console.log(x.data);
                this.total = x.data.apSubmitpricesCount.count;
            });


        // Load Requestprices payRequest Sum - load async
        this.apolloSubmitpricesSum3 = this.apollo.watchQuery({
            query: gql`
                query SubmitpricesSum3($ownerId: String, $status: Int) {
                  apSubmitpricesSum(ownerId: $ownerId, status: $status) {
                    payoutSum
                    payoutCount
                  }
                }
              `,
            variables: {
                ownerId: owner,
                status: this.status
            },
            forceFetch: this.forceFetch
        })
            .map( x => {
                if (x.data.apSubmitpricesSum) {
                    console.warn('######## THE SUM ####### ' + x.data.apSubmitpricesSum.payoutSum);
                    this.payoutSum = x.data.apSubmitpricesSum.payoutSum/100;
                    this.payoutCount = x.data.apSubmitpricesSum.payoutCount;
                }
            });


        // load initial page
        this.getSubmitprices(this.p);
    }


    getSubmitprices(page) {
        this.p = page;
        let options = {
            limit: this.pageSize,
            skip: (this.p - 1) * this.pageSize,
            sort: {updated: this.dateOrder},
        };

        let serializeOptions = JSON.stringify(options);

        // TODO - confirm this userId is secured - not allowed to be hacked?
        // get error when passing Meteor.userId() to ownerId directly, pass through a variable
        let owner = Meteor.userId();

        this._ngZone.run(() => { // run inside Angular2 world
            this.apolloSubmitprices3 = this.apollo.watchQuery({
                query: gql`
                    query MySubmitprices3($ownerId: String, $options: String, $status: Int) {
                        apSubmitprices(ownerId: $ownerId, options: $options, status: $status) {
                            _id
                            priceId
                            owner
                            price
                            submittedAt
                            updated
                            status
                            paidAt
                            payout
                            soldOut
                            note
                            priceT2 {
                                price
                                quantity
                                itemT {
                                    name
                                    size
                                    image
                                }
                                storeT {
                                    name
                                    address
                                }
                            }
                        }
                    }
                `,
                variables: {
                    ownerId: owner,
                    options: serializeOptions,
                    status: this.status
                },
                forceFetch: this.forceFetch
            })
                .map( ({ data }) => {
                    if (data != undefined) {
                        this.display_spinner = false;
                        console.warn('######## THE DATA ####### ' +  data.apSubmitprices.length);

                        // Set catch to skip refetch
                        if (this.forceFetch) {
                            this._cacheState.apolloRefetchCacheSet('sp-closed');
                        }

                        return data.apSubmitprices;
                    }
                });
        });


    }


    detailedView(sp) {
        this.router.navigate(['/spdetails', { spId: sp._id, redirect: 'spclosed' }]);
    }

}
