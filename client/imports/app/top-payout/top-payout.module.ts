import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomMaterialModule } from "../custom-material/custom-material.module";
import { NavigationModule } from '../navigation/navigation.module';
import { MappingModule } from '../mapping/mapping.module';
import { ServicesGlobalModule } from '../services-global/services-global.module';

import { TopPayoutComponent } from './top-payout';

@NgModule({
    imports: [
        CommonModule,
        Ng2PaginationModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: TopPayoutComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        MappingModule,
        ServicesGlobalModule
    ],
    declarations: [
        TopPayoutComponent,
    ]
})
export class TopPayoutModule {

    constructor() {
        console.warn('----- constructor -- TopPayoutModule ------');
    }

}
