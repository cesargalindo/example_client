import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';
import { ServicesModule } from '../../services/services.module';
import { Request1SliderModule } from '../../sliders/request1-slider.module';

import { RequestpricesEditComponent } from './requestprices-edit';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: RequestpricesEditComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule,
        ServicesModule,
        Request1SliderModule
    ],
    declarations: [
        RequestpricesEditComponent
    ]
})
export class RequestpricesEditModule {

    constructor() {
        console.warn('----- constructor -- RequestpricesEditModule ------');
    }

}
