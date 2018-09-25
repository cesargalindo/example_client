import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services-global/UserService';
import { VariablesService } from '../../services-global/VariablesService';

import template from "./submits.html";

@Component({
    selector: 'submits',
    template,
})
export class SubmitsComponent implements OnInit {
    currentDate: number;
    userInfo: Object;

    constructor(
        public _varsService: VariablesService,
        public _userService: UserService) {}


    ngOnInit() {
        this.userInfo = this._userService;
    }


    ngAfterViewInit() {
        this._varsService.setReactiveHideToolbar(false);
        this._varsService.setReactiveTitleName('SUBMITS');
    }
}
