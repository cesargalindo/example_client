import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CustomMaterialModule } from "../custom-material/custom-material.module";
import { LandingPageComponent } from './landing-page';
import { ElasticSearchSS1Component } from './elasticsearch-ss1';
import { ElasticSearchSS2Component } from './elasticsearch-ss2';
import { DialogOverviewComponent } from './dialog-overview';

import { NavigationModule } from '../navigation/navigation.module';
import { MappingModule } from '../mapping/mapping.module';
import { SearchStoreModule } from '../search-stores/search-stores.module';
import { CustomPipesModule } from '../custom-pipes/custom-pipes.module';
import { ApolloXModule } from '../apollo/apollo.module';

import { DialogItemHistoryModule } from '../dialog-item-history/dialog-item-history.module';
import { DialogFilterModule } from '../dialog-filter/dialog-filter.module';
import { DialogLocationModule } from '../dialog-location/dialog-location.module';
import { DialogLocHistoryModule } from '../dialog-loc-history/dialog-loc-history.module';
import { RequestpricesServiceModule } from '../requestprices/requestprices-service/requestprices-service.module';

import { ServicesGlobalModule } from '../services-global/services-global.module';
import { ServicesModule } from '../services/services.module';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: LandingPageComponent,
        }]),
        NavigationModule,
        CustomMaterialModule,
        ApolloXModule,
        MappingModule,
        SearchStoreModule,
        CustomPipesModule,
        ServicesGlobalModule,
        ServicesModule,
        DialogItemHistoryModule,
        DialogFilterModule,
        DialogLocationModule,
        DialogLocHistoryModule,
        RequestpricesServiceModule
    ],
    declarations: [
        LandingPageComponent,
        ElasticSearchSS1Component,
        ElasticSearchSS2Component,
        DialogOverviewComponent,
    ]
})
export class LandingPageModule {

    constructor() {
        console.warn('----- constructor -- LandingPageModule ------');
    }

}
