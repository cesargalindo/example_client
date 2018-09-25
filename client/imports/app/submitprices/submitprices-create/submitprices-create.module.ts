import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomMaterialModule } from "../../custom-material/custom-material.module"
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';
import { ServicesModule } from '../../services/services.module';

import { SubmitpricesServiceModule } from '../submitprices-service/submitprices-service.module';
import { SubmitpricesCreateComponent } from './submitprices-create';

@NgModule({
    imports: [
        CommonModule,
        Ng2PaginationModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: SubmitpricesCreateComponent,
        }]),
        SubmitpricesServiceModule,
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule,
        ServicesModule
    ],
    declarations: [
        SubmitpricesCreateComponent
    ]
})
export class SubmitpricesCreateModule { }
