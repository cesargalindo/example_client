import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { ProfileComponent } from './profile';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{
            path: '', component: ProfileComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule
    ],
    declarations: [
        ProfileComponent
    ]
})
export class ProfileModule {

    constructor() {
        console.warn('----- constructor -- ProfileModule ------');
    }

}
