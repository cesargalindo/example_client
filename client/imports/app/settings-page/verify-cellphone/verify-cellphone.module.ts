import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { VerifyCellphoneComponent } from './verify-cellphone';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: VerifyCellphoneComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule
    ],
    declarations: [
        VerifyCellphoneComponent
    ]
})
export class VerifyCellphoneModule {

    constructor() {
        console.warn('----- constructor -- VerifyCellphoneModule ------');
    }

}
