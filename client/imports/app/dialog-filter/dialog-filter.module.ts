import { NgModule, ModuleWithProviders } from '@angular/core';
import { CustomMaterialModule } from "../custom-material/custom-material.module";

import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DialogFilterComponent } from './dialog-filter';
import { DialogFilterDialogComponent } from './dialog-filter-dialog';
import { ServicesGlobalModule } from '../services-global/services-global.module';

@NgModule({
    imports: [
        CommonModule,
        CustomMaterialModule,
        ServicesGlobalModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [ DialogFilterComponent, DialogFilterDialogComponent ],
    exports: [ DialogFilterComponent, DialogFilterDialogComponent ],
    entryComponents: [
        DialogFilterDialogComponent
    ],
})
export class DialogFilterModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DialogFilterModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- DialogFilterModule ------');
    }
}