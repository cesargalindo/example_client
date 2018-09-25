import { NgModule, ModuleWithProviders } from '@angular/core';
import { CustomMaterialModule } from "../custom-material/custom-material.module";

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SearchStoresComponent } from './search-stores';
import { ServicesGlobalModule } from '../services-global/services-global.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CustomMaterialModule,
        ServicesGlobalModule
    ],
    declarations: [ SearchStoresComponent ],
    exports: [ SearchStoresComponent ]
})
export class SearchStoreModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SearchStoreModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- SearchStoreModule ------');
    }
}