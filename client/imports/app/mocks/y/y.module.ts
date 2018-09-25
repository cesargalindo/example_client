import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';

import { YComponent } from './y';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        RouterModule.forChild([{
            path: '', component: YComponent,
        }]),
        CustomMaterialModule,
        NavigationModule
    ],
    declarations: [
        YComponent
    ]
})
export class YModule {

    constructor() {
        console.warn('----- constructor -- YModule ------');
    }

}
