import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CustomMaterialModule } from "../../custom-material/custom-material.module"
import { NavigationModule } from '../../navigation/navigation.module';
import { CustomPipesModule } from '../../custom-pipes/custom-pipes.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';
import { ServicesModule } from '../../services/services.module';

import { RequestsComponent } from './requests';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([{
            path: '', component: RequestsComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        CustomPipesModule,
        ServicesGlobalModule,
        ServicesModule
    ],
    declarations: [
        RequestsComponent
    ]
})
export class RequestsModule {

    constructor() {
        console.warn('----- constructor -- RequestsModule ------');
    }

}
