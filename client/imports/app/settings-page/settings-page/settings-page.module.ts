import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { SettingsPageComponent } from './settings-page';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{
            path: '', component: SettingsPageComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule
    ],
    declarations: [
        SettingsPageComponent
    ]
})
export class SettingsPageModule {

    constructor() {
        console.warn('----- constructor -- SettingsPageModule ------');
    }

}
