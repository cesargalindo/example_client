import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit } from '@angular/core';
import { Router }  from '@angular/router';
import { Angular2Apollo, ApolloQueryObservable } from 'angular2-apollo';

import { CacheStateService } from '../../services-global/CacheStateService';
import { VariablesService } from '../../services-global/VariablesService';
import { SnackbarService } from '../../services/SnackbarService';

import gql from 'graphql-tag';

import template from "./rq-active.html";

@Component({
    selector: 'rq-active',
    template,
})
export class RQActiveComponent implements OnInit {
    apolloRequestprices1: ApolloQueryObservable<any>;
    apolloRequestpricesCount1: ApolloQueryObservable<any>;
    apolloRequestpricesSum1: ApolloQueryObservable<any>;

    total: number = 0;
    payoutSum: number = 0;
    forceFetch: boolean;

    pageSize: number = 8;
    p: number = 1;
    dateOrder: number = -1;

    // returns all Requestprices with status = 1 and 9
    status: number = 111111;         

    currentDate: number;

    display_spinner: boolean = true;

    constructor(
        public _snackbar: SnackbarService,
        public _varsService: VariablesService,
        private apollo: Angular2Apollo,
        private router: Router,
        private _cacheState: CacheStateService,
        private _ngZone: NgZone) { }

    // NOTE - auth-guard.ts will redirect to home page to load services if page is newly refreshed before getting here
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
        this.forceFetch = this._cacheState.apolloRefetchCacheGet('rq-active');

        // Load Requestprices Count -- it should always return before Requestprices data
        let owner = Meteor.userId();

        this.apolloRequestpricesCount1 = this.apollo.watchQuery({
            query: gql`
            query RequestpricesCount1($ownerId: String, $status: Int) {
              apRequestpricesCount(ownerId: $ownerId, status: $status) {
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
                // console.log(x.data);
                this.total = x.data.apRequestpricesCount.count;
            });


        console.log('forceFetch == ' + this.forceFetch);

        // Load Requestprices payRequest Sum - load async
        this.apolloRequestpricesSum1 = this.apollo.watchQuery({
            query: gql`
            query RequestpricesSum1($ownerId: String, $status: Int) {
              apRequestpricesSum(ownerId: $ownerId, status: $status) {
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
                if (x.data.apRequestpricesSum) {
                    // console.warn(x.data);
                    this.payoutSum = x.data.apRequestpricesSum.payoutSum/100;
                }
            });


        // load initial page
        this.getRequestprices(this.p);
    }


    getRequestprices(page) {
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
            this.apolloRequestprices1 = this.apollo.watchQuery({
                query: gql`
                    query MyRequestprices1($ownerId: String, $options: String, $status: Int) {
                        apRequestprices(ownerId: $ownerId, options: $options, status: $status) {
                            _id
                            priceId
                            owner
                            payRequest
                            requestedAt
                            expiresAt
                            updated
                            status
                            note
                            paidTos {
                                spId
                                owner
                                paidAt
                                payout
                                status
                                submitpriceT {
                                    _id
                                    price
                                }
                            }
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
                        console.warn('######## THE DATA ####### ' +  data.apRequestprices.length);

                        // Set catch to skip refetch
                        if (this.forceFetch) {
                            this._cacheState.apolloRefetchCacheSet('rq-active');
                        }

                        return data.apRequestprices;
                    }
                });
        });


    }


    detailedView(rp) {
        this.router.navigate(['/rqdetails', { rpId: rp._id, redirect: 'rqactive' }]);
    }

}
