import { Component, OnInit } from "@angular/core";

import { VariablesService } from '../../services-global/VariablesService';

import template from "./x.html";
import style from './x.scss';

@Component({
    selector: "x",
    template,
    styles: [ style ],
})
export class XComponent implements OnInit {

    toggleMe: Object = {};

    constructor(public _varsService: VariablesService) { }


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

}


