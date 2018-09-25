import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services-global/UserService';
import { VariablesService } from '../../services-global/VariablesService';

import template from './profile.html';

// username is used as the cellphone 

@Component({
    selector: 'profile',
    template
})
export class ProfileComponent implements OnInit {
    userInfo: Object;

    email: string;
    emailVerified: boolean;
    username: string;
    cellVerified: boolean;

    constructor(
        public _userService: UserService,
        public _varsService: VariablesService,
        private router: Router) { }


    ngOnInit() {
        // If this page is reloaded, redirect to home page to allow user credentials to load
        if (this._userService.cellVerified == undefined) {
            this.router.navigate(['/landing']);
            return;
        }

        // Hide top toolbar to allow buttons to be shown on top
        this._varsService.setReactiveHideToolbar(true);

        this.email = Meteor.user().emails[0].address;
        this.emailVerified = Meteor.user().emails[0].verified;

        // Check is username was overridden
        if (Meteor.user().username != undefined) {
            if (Meteor.user().username.length > 10) {
                this.username = '';
            }
            else {
                this.username = Meteor.user().username;
            }
        }


        this.userInfo = this._userService;
        this.cellVerified = this._userService.cellVerified;

        // If user Info has loaded, leverage reactive Rankings - scenario occurs on a page refresh
        // when user rankings is loaded, so are other user's settings,
        let reactiveRankings = this._userService.getReactiveRanking();
        reactiveRankings.subscribe(x => {
            this.userInfo = this._userService;
            this.cellVerified = this._userService.cellVerified;
        });

    }


    editProfile() {
        this.router.navigate(['/profile-edit']);
    }

    verifyEmail() {
        this.router.navigate(['/email-link']);
    }

    verifyCellphone() {
        this.router.navigate(['/verify-cell']);
    }

}