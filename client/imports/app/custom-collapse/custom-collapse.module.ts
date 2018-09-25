import { NgModule, ModuleWithProviders } from '@angular/core';
import { CustomMaterialModule } from "../custom-material/custom-material.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomCollapseComponent } from './custom-collapse';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CustomMaterialModule,
    ],
    declarations: [ CustomCollapseComponent ],
    exports: [ CustomCollapseComponent ]
})
export class CustomCollapseModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CustomCollapseModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- CustomCollapseModule ------');
    }
}