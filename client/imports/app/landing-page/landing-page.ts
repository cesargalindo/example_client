import { Component, OnInit, NgZone } from '@angular/core';
import { Router }  from '@angular/router';
import { VariablesService } from '../services-global/VariablesService';

import template from './landing-page.html';

@Component({
    selector: 'landing-page',
    template,
})

export class LandingPageComponent implements OnInit {
    item: Object;
    settingsVisible: boolean = false;
    settingsStyle: Object = {'display':'none'};
    showSearchIcon: boolean = true;
    showSearchbar: boolean = true;
    constructor(
        public _varsService: VariablesService,
        private router: Router,
        private _ngZone: NgZone) { }

    ngOnInit() {
        this._varsService.setReactiveHideToolbar(false);
        this._varsService.setReactiveTitleName('HOME');
    }

    toggleSettingsVisibility() {
        this.settingsVisible = !this.settingsVisible;
        if (!this.settingsVisible) {
            this.settingsStyle={'display':'none'}
        } else {
            this.settingsStyle={}
        }
    }

    toggleSearchbarVisibility() {
      this.showSearchbar = !this.showSearchbar;

    }

    // s4s - OUTPUT from elasticsearch-ss1 is INPUT here...
    // s4s-A - INPUT from lading-page.ts is OUTPUT to elasticsearch-ss2 by settings this.item = item
    select(item) {
        this._ngZone.run(() => { // run inside Angular2 world
            // important - I can pass parameters using INPUT/OUTPUT or leverage reactivity of a local collection
            // preference is to leverage reactivity of local mongo collection :)
            this.showSearchbar = !this.showSearchbar;
            this.item = item;
        });
    }

}
