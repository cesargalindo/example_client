import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';
import { ServicesModule } from '../../services/services.module';

import { SubmitsComponent } from './submits';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{
            path: '', component: SubmitsComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule,
        ServicesModule
    ],
    declarations: [
        SubmitsComponent,
    ]
})
export class SubmitsModule {

    constructor() {
        console.warn('----- constructor -- SubmitsModule ------');
    }

}
