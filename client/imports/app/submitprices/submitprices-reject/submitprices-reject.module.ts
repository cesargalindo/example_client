import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomMaterialModule } from "../../custom-material/custom-material.module"
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';
import { ServicesModule } from '../../services/services.module';
import { CustomPipesModule } from '../../custom-pipes/custom-pipes.module';

import { SubmitpricesRejectComponent } from './submitprices-reject';
import { SubmitpricesServiceModule } from '../submitprices-service/submitprices-service.module';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: SubmitpricesRejectComponent,
        }]),
        SubmitpricesServiceModule,
        CustomMaterialModule,
        NavigationModule,
        CustomPipesModule,
        ServicesGlobalModule,
        ServicesModule
    ],
    declarations: [
        SubmitpricesRejectComponent
    ]
})
export class SubmitpricesRejectModule { }
