import { Component, OnInit } from '@angular/core';
import { Router }  from '@angular/router';
import { Observable } from "rxjs/Observable";
import { VariablesService } from '../services-global/VariablesService';

import template from './submit-page.html';

@Component({
    selector: 'submit-page',
    template,
})

export class SubmitPageComponent implements OnInit {
    item: Object;

    constructor(
        public _varsService: VariablesService,
        private router: Router) { }

    ngOnInit() {
        // create activity after page has loaded to force call to ngAfterViewInit()
        let tmpObv = new Observable(observer => {
            setTimeout(() => {
                observer.next(4);
            }, 10);
        }).first();
        tmpObv.subscribe();
    }

    ngAfterViewInit() {
        this._varsService.setReactiveHideToolbar(false);
        this._varsService.setReactiveTitleName('Payouts');
    }


}



