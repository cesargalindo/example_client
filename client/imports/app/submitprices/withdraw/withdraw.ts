/**
 *  User can withdraw through Paypal, Venmo, Check
 *
 *
 *
 *  Paypal an Venmo widthrawals are usually processed withing a few hours but can take up to 24 hours
 *
 *  1) create a separate form where the user enter the amount he/she wishes and
 *          the Paypal/Venmo email the money should be sent to
 *
 *  2) Clicks submit - the transaction is recorded in the deposits table?? and ledger table is updated accordingly
 *
 *
 *
 *  For check:
 *  Can only be mailed to a legitimate CA address.  PO Boxes are not allowed.
 */
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services-global/UserService';
import { VariablesService } from '../../services-global/VariablesService';

import template from "./withdraw.html";

@Component({
    selector: 'withdraw',
    template,
})
export class WithdrawComponent implements OnInit {
    currentDate: number;
    userInfo: Object;

    constructor(
        public _varsService: VariablesService,
        public _userService: UserService) {}

    ngOnInit() {
        this.userInfo = this._userService;
        this._varsService.setReactiveHideToolbar(true);
    }
}
