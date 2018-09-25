import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit }   from '@angular/core';
import { Router }  from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { UserService } from '../../services-global/UserService';
import { VariablesService } from '../../services-global/VariablesService';

import template from './verify-cellphone.html';

@Component({
    selector: 'verify-cellphone',
    template,
})
export class VerifyCellphoneComponent implements OnInit {
    cellphoneForm: FormGroup;
    verifyForm: FormGroup;

    smsSent: boolean = false;
    codeVerified: boolean = false;

    error: string;
    error2: string;
    display_spinner: boolean = false;
    display_spinner2: boolean = false;

    constructor(
        private router: Router,
        public _varsService: VariablesService,
        private formBuilder: FormBuilder,
        public _userService: UserService,
        private _ngZone: NgZone) { }


    ngOnInit() {
        // If this page is reloaded, redirect to home page to allow user credentials to load
        if (this._userService.cellVerified == undefined) {
            this.router.navigate(['/landing']);
            return;
        }

        this._varsService.setReactiveTitleName('VERIFY CELLPHONE');

        this.cellphoneForm = this.formBuilder.group({
            cellphone: [''],
        });

        this.verifyForm = this.formBuilder.group({
            code: ['']
        });


        if (Meteor.user().username == undefined) {
            this.cellphoneForm.patchValue({ cellphone: '' });
        }
        else {
            // check if username was overridden
            if (Meteor.user().username.length > 10 ) {
                this.cellphoneFormat('');
            }
            else {
                this.cellphoneFormat( Meteor.user().username );
            }
        }

    }


    sendSMSCode() {


            if (this.cellphoneValidator(this.cellphoneForm.value.cellphone)) {

                this.display_spinner = true;
                let cellPhone = this.cellphoneForm.value.cellphone.replace(/\D/g, '');

                Meteor.call('sendTwilioSMS', cellPhone, (err, res) => {

                    this._ngZone.run(() => { // run inside Angular2 world
                        this.display_spinner = false;

                        if (err) {
                            this.error = err;
                            throw new Meteor.Error(err.statusCode, 'Error getting client token from Braintree');
                        }
                        else {
                            if (res.status) {
                                console.log( 'SMS Sent to ' + cellPhone);
                                console.log(res);
                                this.smsSent = true;
                                this.error = '';
                            }
                            else {
                                this.smsSent = false;
                                this.error = res.error;
                            }
                        }
                    });

                });
            }

    }

    /**
     * Format cellphone to (209) 334 - 3434
     */
    cellphoneFormat(cellphone: string) {

        // Strip all characters from the input except digits
        let input = cellphone.replace(/\D/g, '');

        // Trim the remaining input to ten characters, to preserve phone number format
        input = input.substring(0, 10);

        // Based upon the length of the string, we add formatting as necessary
        var size = input.length;
        if (size == 0) {
            input = input;
        } else if (size < 4) {
            input = '(' + input;
        } else if (size < 7) {
            input = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6);
        } else {
            input = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6) + ' - ' + input.substring(6, 10);
        }

        this.cellphoneForm.patchValue({cellphone: input});
    }


    cellphoneValidator(cellphone: string): boolean {
        // Strip all characters from the input except digits
        let input = cellphone.replace(/\D/g, '');

        if (input.length == 10) {
            return true;
        }

        return false;
    }


    /**
     * Verify SMS code sent to user
     *
     */
    VerifyCode() {


            if (this.codeValidator(this.verifyForm.value.code)) {

                this.display_spinner2 = true;

                let code = parseInt(this.verifyForm.value.code);

                Meteor.call('verifyTwilioSMS', code, (err, res) => {

                    this._ngZone.run(() => { // run inside Angular2 world

                        this.display_spinner2 = false;

                        if (err) {
                            this.error2 = err;
                            throw new Meteor.Error(err.statusCode, 'Error verifying SMS code.');
                        }
                        else {

                            if (res.status) {
                                // reload latest user data
                                this._userService.initializeUserInfo(true);

                                console.log( 'Code verified passed: ' + this.verifyForm.value.code);
                                console.log(res);
                                this.codeVerified = true;
                                this.error = '';
                            }
                            else {
                                this.codeVerified = false;
                                this.error2 = res.error;
                            }
                        }

                    });



                });
            }
            else {
                this.codeVerified = false;
                this.error2 = '';
            }
    }


    codeValidator(code: string): boolean {
        if (code.length== 6) {
            // ensure code is only digits
            if (!/^[0-9]+$/.test(code)) {
                return false;
            }
            return true;
        }
        return false;
    }


}
