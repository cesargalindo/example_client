import { Component, OnInit }   from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';

import { UserService } from '../../services-global/UserService';
import { VariablesService } from '../../services-global/VariablesService';

import template from './verify-email.html';

/**
 * the path verify-email conflicts with default verify-email path
 */
@Component({
    selector: 'verify-email',
    template,
})
export class VerifyEmailComponent implements OnInit {
    error: string;
    display_spinner: boolean = true;
    email: string;
    success: boolean = false;

    constructor(
        private route: ActivatedRoute,
        public _varsService: VariablesService,
        public _userService: UserService) { }


    ngOnInit() {

        // this.email = Meteor.user().emails[0].address;
        this.display_spinner = true;
        this._varsService.setReactiveTitleName('VERIFY CELLPHONE');

        this.route.params.subscribe((params) => {
            if (params['token']) {

                Accounts.verifyEmail( params['token'], ( error ) => {
                    this.display_spinner = false;

                    if ( error ) {
                        this.error = error;

                    } else {
                        // Email verified field is set to true
                        this.success = true;
                    }

                });
            }

        });

    }


}
