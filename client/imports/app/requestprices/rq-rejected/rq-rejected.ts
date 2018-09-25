import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit } from '@angular/core';
import { Router }  from '@angular/router';
import { Angular2Apollo, ApolloQueryObservable } from 'angular2-apollo';

import { CacheStateService } from '../../services-global/CacheStateService';
import { VariablesService } from '../../services-global/VariablesService';
import { SnackbarService } from '../../services/SnackbarService';

import gql from 'graphql-tag';

import template from "./rq-rejected.html";

@Component({
    selector: 'rq-rejected',
    template,
})
export class RQRejectedComponent implements OnInit {
    apolloRequestprices3: ApolloQueryObservable<any>;
    apolloRequestpricesCount3: ApolloQueryObservable<any>;

    total: number = 0;
    forceFetch: boolean;

    pageSize: number = 8;
    p: number = 1;
    dateOrder: number = -1;

    // returns all Requestprices with status = 8
    status: number = 8;         

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
        this.forceFetch = this._cacheState.apolloRefetchCacheGet('rq-rejected');

        // Load Requestprices Count -- it should always return before Requestprices data
        let owner = Meteor.userId();
        this.apolloRequestpricesCount3 = this.apollo.watchQuery({
            query: gql`
                query RequestpricesCount3($ownerId: String, $status: Int) {
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
                console.warn('######## THE COUNT ####### ' +  x.data.apRequestpricesCount.count);
                this.total = x.data.apRequestpricesCount.count;
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
            this.apolloRequestprices3 = this.apollo.watchQuery({
                query: gql`
                    query MyRequestprices3($ownerId: String, $options: String, $status: Int) {
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
                    this.display_spinner = false;
                    console.warn('######## THE DATA ####### ' +  data.apRequestprices.length);

                    // Set catch to skip refetch
                    if (this.forceFetch) {
                        this._cacheState.apolloRefetchCacheSet('rq-rejected');
                    }

                    return data.apRequestprices;
                });
        });


    }


    detailedView(rp) {
        this.router.navigate(['/rqdetails', { rpId: rp._id, redirect: 'rqrejected' }]);
    }


}
