import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit }   from '@angular/core';
import { Router }  from '@angular/router';
import { UserService } from '../../services-global/UserService';
import { SnackbarService } from '../../services/SnackbarService';
import { VariablesService } from '../../services-global/VariablesService';

import { Session } from 'meteor/session';
let braintree = require('braintree-web');

import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import template from "./deposit.html";


/**
 *
 * Reworked code from here...
 * http://blog.trombone.io/taking-payments-with-meteor-braintree/
 *
 * meteor npm install --save braintree      -- add to package.json   "braintree": "1.47.1",
 * meteor npm install --save braintree-web  -- add to package.json   "braintree-web": "2.30.0",
 *
 * meteor add kevohagan:sweetaler
 * meteor add alanning:roles
 * meteor add session
 * meteor reset
 * meteor --settings settings-dev-local.json
 *
 * Log into Braintree account
 * Use Paypal accounts:  cesar@mutilo.com or famolare_95205
 *
 *
 * Credit Card Validation
 * http://stackoverflow.com/questions/36147908/credit-card-form-validation-using-angular-2
 * https://jsfiddle.net/pmrotule/217u7fru/
 * http://stackoverflow.com/questions/36568425/javascript-credit-card-field-add-space-every-four-chars-backspace-not-workin/39804917#39804917
 *
 */
@Component({
    selector: 'deposit',
    template,
})
export class DepositComponent implements OnInit {
    paymentForm: FormGroup;

    largeAmountWarning: number;

    firstname_required: boolean = false;
    lastname_required: boolean = false;

    amount_state: number;
    amount_required: boolean = false;

    step_0: boolean = true;         // Confirm user's email and cell phone number have been verified
    step_1: boolean = false;        // Step 1: request user's info
    step_2: boolean = false;        // Step 2: request payment info
    step_3: boolean = false;        // Step 3: Deposit was successful
    step_4: boolean = false;        // Step 4: Deposit failed

    step3_zone: boolean = false;
    step4_zone: boolean = false;

    display_spinner: boolean = false;
    emailVerified: boolean;

    transactionId: string;
    transactionError: boolean;

    vars: any;

    constructor(
        public _snackbar: SnackbarService,
        private formBuilder: FormBuilder,
        public _varsService: VariablesService,

        private router: Router,
        public _userService: UserService,
        private _ngZone: NgZone) { }


    ngOnInit() {
        // If this page is reloaded, redirect to home page to allow user credentials to load
        if (this._userService.cellVerified == undefined) {
            this.router.navigate(['/landing']);
            return;
        }
        // ensure cellphone number and email address have been verified
        else if (this._userService.cellVerified && Meteor.user().emails[0].verified) {
            this.step_0 = false;
            this.step_1 = true;
        }

        // Check if user has access
        this._snackbar.verifyUserAccess(true);
        this._varsService.setReactiveHideToolbar(true);

        this.vars = this._varsService;

        this.paymentForm = this.formBuilder.group({
            // amount: ['', [Validators.required, Validators.pattern(/^\d+\.\d{2}$/)] ],
            amount: ['', Validators.required ],
            firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)] ],
            minitial: [''],
            lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(45)] ],
        })

        this.emailVerified = Meteor.user().emails[0].verified;

        this.paymentForm.valueChanges
            .subscribe( (formValues ) => {

                // Provide dynamic validation display for large amounts and NaN on amount field
                console.log(formValues);
                console.log(this.paymentForm.controls);

                if (formValues.amount != this.amount_state) {
                    if (isNaN(formValues.amount)) {
                        this.amount_required = true;
                    }
                    else {
                        this.amount_required = false;

                        if (formValues.amount > 50) {
                            this.largeAmountWarning = 1;
                        }
                        else {
                            this.largeAmountWarning = 0;
                        }
                    }
                }

            });

    }


    /**
     * Step 1 of the payment form
     *
     */
    processStep1() {

        console.log('>>>>>>>>>>>>>>> ' + this.paymentForm.valid);
        if (this.paymentForm.valid) {

            this.firstname_required = false;
            this.lastname_required = false;

            if (Meteor.userId()) {
                console.log(this.paymentForm.value.amount  + ' - ' + this.paymentForm.value.firstname);

                console.log(this.paymentForm);
                console.log(this.paymentForm.controls);

                if (this.amount_required) {

                    return;
                }
                else {
                    this.goToPaymentForm(this.paymentForm.value);
                }

            } else {
                alert('Please log in to add a party');
                return;
            }
        }
        else {

            if (this.paymentForm.controls.firstname._status == 'INVALID') {
                this.firstname_required = true;
            }
            else if (this.paymentForm.controls.lastname._status == 'INVALID') {
                // skip got errors
                this.firstname_required = false;
                this.lastname_required = true;
            }
            else if (this.paymentForm.controls.amount._status == 'INVALID') {
                this.firstname_required = false;
                this.lastname_required = false;
                this.amount_required = true;
            }
        }

    }


    /**
     * Step2 of the payment form
     *
     */
    goToPaymentForm(formValues) {

        this.step_1 = false;
        this.step_2 = true;

        let cpThis  = this;

        Meteor.call('getClientToken', (err, clientToken) => {

            if (err) {
                throw new Meteor.Error(err.statusCode, 'Error getting client token from braintree');
            }

            console.log("------- this.paymentProcessing -------- " + formValues.amount);

            braintree.setup(clientToken, 'dropin', {
                container: 'payment-form',
                paymentMethodNonceReceived(event, nonce) {

                    console.log(nonce);

                    Meteor.call('gatewayTranasctionSale', formValues, nonce, (error, result) => {
                        Session.set('paymentProcessing', false);
                        // this.paymentProcessing = false;
                        cpThis.display_spinner = false;

                        if (error) {
                            console.warn('------- payment form result - error -------');
                            console.error(error);

                            cpThis.transactionId = '--';
                            cpThis.transactionError = error;
                            cpThis.step_2 = false;
                            cpThis.step_3 = true;
                            cpThis.stepZone(3);
                        }
                        else {
                            if (result.status) {
                                cpThis.transactionId = result.id;
                                cpThis.step_2 = false;
                                cpThis.step_4 = true;
                                cpThis.stepZone(4);
                                // TODO - add deposit amount to ledger
                            }
                            else {
                                cpThis.transactionId = result.id;
                                cpThis.transactionError = result.error;
                                cpThis.step_2 = false;
                                cpThis.step_3 = true;
                                cpThis.stepZone(3);
                                // this.router.navigate(['/money']);
                            }
                        }

                    });

                },
            });
        });

    }

    stepZone(step) {
        this._ngZone.run(() => {
            if (step == 3) {
                this.step3_zone = true;
            }
            else {
                this.step4_zone = true;
                // TODO - add deposit amount to ledger
            }
        });
    }

    submitBraintreeForm() {
        this.display_spinner = true;
    }

    goToProfile() {
        this.router.navigate(['/profile']);
    }

    numberOfDecimalPlaces (number) {
        let match = ('' + number).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match || match[0] == 0) {
            return 0;
        }
        return match[0].length;
    }

}

