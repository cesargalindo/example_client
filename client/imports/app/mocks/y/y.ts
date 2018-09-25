import { Component, OnInit } from "@angular/core";

import { VariablesService } from '../../services-global/VariablesService';

import template from "./y.html";
import style from './y.scss';

@Component({
    selector: "y",
    template,
    styles: [ style ],
})
export class YComponent implements OnInit {


    constructor(public _varsService: VariablesService) { }


    ngOnInit() { }

    check123(x) {
        alert('thumbs up... ' + x);
    }

    check555(x) {
        alert('thumbs up... ' + x);
    }
}
