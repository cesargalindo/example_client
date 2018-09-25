import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router }  from '@angular/router';
import { Angular2Apollo, ApolloQueryObservable } from 'angular2-apollo';

import { VariablesService } from '../../services-global/VariablesService';
import { SnackbarService } from '../../services/SnackbarService';

import gql from 'graphql-tag';

import template from "./rq-detailed-view.html";

@Component({
    selector: 'rq-detailed-view',
    template,
})
export class RQDetailedViewComponent implements OnInit {
    apolloRequestpricesbyId: ApolloQueryObservable<any>;

    rpId: string;
    redirect: string;
    rpData: Object = {};

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
        this.rpData['status'] = 0;

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
            this.rpId = params['rpId'];
            let owner = Meteor.userId();

            console.log(owner + ' -- ' + this.rpId + ' -- ' + this.redirect);

            this.apolloRequestpricesbyId = this.apollo.watchQuery({
                query: gql`
                query RequestpricesbyId($rpId: String, $ownerId: String) {
                  apRequestpricesbyId(rpId: $rpId, ownerId: $ownerId) {
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
                    rpId: this.rpId,
                    ownerId: owner
                },
                forceFetch: true
            })
                .map( x => {
                    this.display_spinner = false;
                    console.warn('######## da data ####### ' +  x.data.apRequestpricesbyId.count);
                    console.log(x.data);
                    this.rpData = x.data.apRequestpricesbyId[0];
                    return x.data.apRequestpricesbyId;
                });

        });

    }



    editRequestPrice() {
        // Allow user to edit only if status = 1
        if (this.rpData.status == 1) {
            this.router.navigate(['/requestprices-edit', { priceId: this.rpData.priceId, requestId: this.rpData._id }]);
        }
        // Allow user to edit only if status = 9
        else  if (this.rpData.status == 9) {
            this.router.navigate(['/requestprices-ip', { priceId: this.rpData.priceId, requestId: this.rpData._id }]);
        }
    }


    cancelRequestPrice() {
        // Allow user to cancel only if status = 1
        if (this.rpData.status == 1) {
            this.router.navigate(['/requestprices-edit', { priceId: this.rpData.priceId, requestId: this.rpData._id, cancel: true }]);
        }
        // Allow user to cancel only if status = 9
        if (this.rpData.status == 9) {
            this.router.navigate(['/requestprices-ip', {priceId: this.rpData.priceId, requestId: this.rpData._id, cancel: true}]);
        }
    }



    RejectSubmittedPrice() {
        this.router.navigate(['/submitprices-reject', {
            rpId: this.rpData._id,
            priceId: this.rpData.priceId,
            spId: this.rpData.paidTos[0].spId,
            price: this.rpData.paidTos[0].submitpriceT.price
        }]);
    }


    redirectBack() {
        this.router.navigate(['/' + this.redirect]);
    }

}
