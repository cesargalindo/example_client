import { Component, OnInit } from "@angular/core";

import { VariablesService } from '../../services-global/VariablesService';
import { UserService } from '../../services-global/UserService';

import template from "./v.html";
import style from './v.scss';

@Component({
    selector: "v",
    template,
    styles: [ style ],
})
export class VComponent implements OnInit {

    toggleMe: Object = {};

    constructor(
        public _varsService: VariablesService,
        public _userService: UserService)
    { }

    ngOnInit() {
        this.toggleMe[1] = 1;
        this.toggleMe[2] = 1;
        this.toggleMe[3] = 1;
        this.toggleMe[4] = 1;
        this.toggleMe[5] = 1;
        this.toggleMe[6] = 1;
        this.toggleMe[7] = 1;
        this.toggleMe[8] = 1;
        this.toggleMe[9] = 1;
        this.toggleMe[10] = 1;
    }

    selectPrice(x, y) {
        this._varsService.selectedPriceId = x;
        this._varsService.selectedItemId = y;
    }

    check123(x) {
        alert('thumbs up... ' + x);
    }

    check555(x) {
        alert('thumbs up... ' + x);
    }

    toggleMeFunc(x) {
        if (this.toggleMe[x]) {
            this.toggleMe[x] = 0;
        }
        else {
            this.toggleMe[x] = 1;
        }
    }

    thumbsUpClick(priceId) {
        this._userService.thumbsUpClicked(priceId);
    }
}
