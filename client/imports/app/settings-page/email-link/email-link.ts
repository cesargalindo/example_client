import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit }   from '@angular/core';
import { Router }  from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { UserService } from '../../services-global/UserService';
import { VariablesService } from '../../services-global/VariablesService';

import template from './email-link.html';

/**
 * the path verify-email conflicts with default verify-email path
 */
@Component({
    selector: 'email-link',
    template,
})
export class EmailLinkComponent implements OnInit {
    emailForm: FormGroup;
    emailVerified: boolean = false;
    error: string;
    display_spinner: boolean = false;
    email: string;

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

        this._varsService.setReactiveTitleName('EMAIL LINK');

        this.emailForm = this.formBuilder.group({
            email: [''],
        });

        this.email = Meteor.user().emails[0].address;
    }


    sendVerificationEmail() {

        this.display_spinner = true;

        Meteor.call('sendVerificationLink', (err, res) => {

            this._ngZone.run(() => { // run inside Angular2 world
                this.display_spinner = false;

                if (err) {
                    this.error = err;
                }
                else {
                    console.log('x-x-x-x- sendVerificationLink x-x-x-xx-x-x-');
                    this.emailVerified = true;
                    this.error = '';
                }
            });

        });

    }



}
