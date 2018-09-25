import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { SliderSettingsComponent } from './slider-settings';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: SliderSettingsComponent,
        }]),
        CustomMaterialModule,
        ServicesGlobalModule,
        NavigationModule,
    ],
    declarations: [
        SliderSettingsComponent
    ]
})
export class SliderSettingsModule {

    constructor() {
        console.warn('----- constructor -- SliderSettingsModule ------');
    }

}
