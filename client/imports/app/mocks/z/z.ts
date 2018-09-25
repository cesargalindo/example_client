import { Component, OnInit } from "@angular/core";

import { VariablesService } from '../../services-global/VariablesService';

import template from "./z.html";
import style from './z.scss';

@Component({
    selector: "z",
    template,
    styles: [ style ],
})
export class ZComponent implements OnInit {


    constructor(public _varsService: VariablesService) { }


    ngOnInit() { }

    check123(x) {
        alert('thumbs up... ' + x);
    }

    check555(x) {
        alert('thumbs up... ' + x);
    }
}
