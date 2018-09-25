import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';

import { ZComponent } from './z';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        RouterModule.forChild([{
            path: '', component: ZComponent,
        }]),
        CustomMaterialModule,
        NavigationModule
    ],
    declarations: [
        ZComponent
    ]
})
export class ZModule {

    constructor() {
        console.warn('----- constructor -- ZModule ------');
    }

}
