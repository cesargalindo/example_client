import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';
import { ServicesModule } from '../../services/services.module';
import { SearchStoreModule } from '../../search-stores/search-stores.module';
import { Request1SliderModule } from '../../sliders/request1-slider.module';

import { RequestpricesServiceModule } from '../requestprices-service/requestprices-service.module';
import { RequestpricesCreatePComponent } from './requestprices-create-p';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: RequestpricesCreatePComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule,
        ServicesModule,
        RequestpricesServiceModule,
        SearchStoreModule,
        Request1SliderModule
    ],
    declarations: [
        RequestpricesCreatePComponent
    ]
})
export class RequestpricesCreatePModule {

    constructor() {
        console.warn('----- constructor -- RequestpricesCreatePModule ------');
    }

}
