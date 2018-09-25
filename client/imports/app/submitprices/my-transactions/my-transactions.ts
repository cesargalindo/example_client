import { Component, OnInit } from '@angular/core';

import { CacheStateService } from '../../services-global/CacheStateService';
import { VariablesService } from '../../services-global/VariablesService';

import template from "./my-transactions.html";

@Component({
    selector: 'my-transactions',
    template,
})
export class MyTransactionsComponent implements OnInit {
    currentDate: number;

    total: number;
    pageSize: number = 5;
    p: number = 1;
    dateOrder: number = -1;

    constructor(
        public _varsService: VariablesService,
        private _cacheState: CacheStateService) {}

    ngOnInit() {
        this._varsService.setReactiveTitleName('MY TRANSACTIONS');


    }




}
