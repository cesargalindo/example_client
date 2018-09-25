import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesModule } from '../../services/services.module';

import { XComponent } from './x';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        RouterModule.forChild([{
            path: '', component: XComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesModule
    ],
    declarations: [
        XComponent
    ]
})
export class XModule {

    constructor() {
        console.warn('----- constructor -- XModule ------');
    }

}
