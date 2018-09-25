import { Component } from '@angular/core';
import { VariablesService } from '../services-global/VariablesService';

import template from "./dialog-overview.html";

@Component({
    selector: 'my-money',
    template,
})
export class DialogOverviewComponent {
    constructor(public _varsService: VariablesService) {
        this._varsService.setReactiveHideToolbar(false);
        this._varsService.setReactiveTitleName('HELP');
    }
}
