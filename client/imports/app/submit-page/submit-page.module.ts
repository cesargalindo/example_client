import { NgModule    } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomMaterialModule } from "../custom-material/custom-material.module";

import { NavigationModule } from '../navigation/navigation.module';
import { SearchStoreModule } from '../search-stores/search-stores.module';
import { CustomPipesModule } from '../custom-pipes/custom-pipes.module';
import { ServicesGlobalModule } from '../services-global/services-global.module';
import { ServicesModule } from '../services/services.module';

import { DialogStoreModule } from '../dialog-store/dialog-store.module';

import { SubmitPageComponent } from './submit-page';
import { ElasticSearchSS3Component } from './elasticsearch-ss3';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: SubmitPageComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        SearchStoreModule,
        CustomPipesModule,
        ServicesGlobalModule,
        ServicesModule,
        DialogStoreModule,
    ],
    declarations: [
        SubmitPageComponent,
        ElasticSearchSS3Component,
    ]
})
export class SubmitPageModule {
    constructor() {
        console.warn('----- constructor -- SubmitPageModule ------');
    }
}
