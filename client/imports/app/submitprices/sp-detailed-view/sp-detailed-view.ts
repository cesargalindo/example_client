import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router }  from '@angular/router';
import { Angular2Apollo, ApolloQueryObservable } from 'angular2-apollo';

import { VariablesService } from '../../services-global/VariablesService';
import { SnackbarService } from '../../services/SnackbarService';

import gql from 'graphql-tag';

import template from "./sp-detailed-view.html";

@Component({
    selector: 'sp-detailed-view',
    template,
})
export class SPDetailedViewComponent implements OnInit {
    apolloSubmitpricesbyId: ApolloQueryObservable<any>;

    spId: string;
    redirect: string;
    spData: Object = {};

    status: number = 1;         // returns all Requestprices with status = 1

    currentDate: number;

    display_spinner: boolean = true;

    constructor(
        public _snackbar: SnackbarService,
        public _varsService: VariablesService,
        private apollo: Angular2Apollo,
        private route: ActivatedRoute,
        private router: Router,
        private _ngZone: NgZone) { }

    // NOTE - auth-guard.ts will redirect to home page to load services if page is newly refreshed before getting here
    ngOnInit() {
        // Initialize status for the view
        this.spData['status'] = 0;

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

        this.route.params.subscribe((params) => {
            this.redirect = params['redirect'];
            this.spId = params['spId'];
            let owner = Meteor.userId();

            this.apolloSubmitpricesbyId = this.apollo.watchQuery({
                query: gql`
                query SubmitpricesbyId($spId: String, $ownerId: String) {
                  apSubmitpricesbyId(spId: $spId, ownerId: $ownerId) {
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
                            unit
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
                    spId: this.spId,
                    ownerId: owner
                },
                forceFetch: true
            })
                .map( x => {
                    this.display_spinner = false;
                    console.warn('######## da data ####### ' +  x.data.apSubmitpricesbyId.count);
                    console.log(x.data);
                    this.spData = x.data.apSubmitpricesbyId[0];
                    return x.data.apSubmitpricesbyId;
                });

        });

    }

    redirectBack() {
        this.router.navigate(['/' + this.redirect]);

    }

}
