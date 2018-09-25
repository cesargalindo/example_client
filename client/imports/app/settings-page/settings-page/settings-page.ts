import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VariablesService } from '../../services-global/VariablesService';

import template from './settings-page.html';

@Component({
    selector: 'settings-page',
    template
})
export class SettingsPageComponent implements OnInit {

    constructor(
        public _varsService: VariablesService,
        private router: Router) { }

    ngOnInit() { }

    ngAfterViewInit() {
        // Hide top toolbar to allow buttons to be shown on top
        this._varsService.setReactiveHideToolbar(false);
        this._varsService.setReactiveTitleName('SETTINGS');
    }


}

