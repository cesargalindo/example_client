import { Component, OnInit } from "@angular/core";

import { VariablesService } from '../../services-global/VariablesService';

import template from "./mocks.html";
import style from './mocks.scss';

@Component({
    selector: "mocks",
    template,
    styles: [ style ],
})
export class MocksComponent implements OnInit {


    constructor(public _varsService: VariablesService) { }


    ngOnInit() { }

    check123(x) {
        alert('thumbs up... ' + x);
    }

    check555(x) {
        alert('thumbs up... ' + x);
    }
}
