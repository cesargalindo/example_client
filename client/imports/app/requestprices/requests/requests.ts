import { Meteor } from 'meteor/meteor';
import { Component, NgZone, OnInit } from '@angular/core';
import { Router }  from '@angular/router';

import { SnackbarService } from '../../services/SnackbarService';
import { UserService } from '../../services-global/UserService';

import template from "./requests.html";

@Component({
    selector: 'rq-active',
    template,
})
export class RequestsComponent implements OnInit {

    total: number = 0;

    display_spinner: boolean = true;

    buyRequest: string;
    buyRequests = [
      '300 for $3.00',
      '510 for $5.00',
      '1,100 for $10.00',
      '2,300 for $20.00',
    ];

    constructor(
        public _userService: UserService,                
        public _snackbar: SnackbarService,
        private router: Router,
        private _ngZone: NgZone) { }

    // NOTE - auth-guard.ts will redirect to home page to load services if page is newly refreshed before getting here
    ngOnInit() {
        // Check if user has access
        this._snackbar.verifyUserAccess(true);
    }


    detailedView(rp) {
        this.router.navigate(['/rqdetails', { rpId: rp._id, redirect: 'rqactive' }]);
    }

}
