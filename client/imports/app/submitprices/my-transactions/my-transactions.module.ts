import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { MyTransactionsComponent } from './my-transactions';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{
            path: '', component: MyTransactionsComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule
    ],
    declarations: [
        MyTransactionsComponent,
    ]
})
export class MyTransactionsModule {

    constructor() {
        console.warn('----- constructor -- MyTransactionsModule ------');
    }

}
