import { NgModule, ModuleWithProviders } from '@angular/core';
import { CustomMaterialModule } from "../custom-material/custom-material.module";

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Request1SliderComponent } from './request1-slider';
import { ServicesGlobalModule } from '../services-global/services-global.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CustomMaterialModule,
        ServicesGlobalModule
    ],
    declarations: [ Request1SliderComponent ],
    exports: [ Request1SliderComponent ]
})
export class Request1SliderModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: Request1SliderModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- Request1SliderModule ------');
    }
}