import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomMaterialModule } from "../../custom-material/custom-material.module"
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';
import { ServicesModule } from '../../services/services.module';
import { SearchStoreModule } from '../../search-stores/search-stores.module';

import { SubmitpricesCreatePComponent } from './submitprices-p';
import { SubmitpricesServiceModule } from '../submitprices-service/submitprices-service.module';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: SubmitpricesCreatePComponent,
        }]),
        SubmitpricesServiceModule,
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule,
        ServicesModule,
        SearchStoreModule
    ],
    declarations: [
        SubmitpricesCreatePComponent
    ]
})
export class SubmitpricesCreatePModule { }
