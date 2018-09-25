import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';

import { TComponent } from './t';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        RouterModule.forChild([{
            path: '', component: TComponent,
        }]),
        CustomMaterialModule,
        NavigationModule
    ],
    declarations: [
        TComponent
    ]
})
export class TModule {

    constructor() {
        console.warn('----- constructor -- TModule ------');
    }

}
