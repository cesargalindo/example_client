import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { DialogVModule } from '../dialog-v/dialog-v.module';

import { VComponent } from './v';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        RouterModule.forChild([{
            path: '', component: VComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        DialogVModule
    ],
    declarations: [
        VComponent
    ]
})
export class VModule {

    constructor() {
        console.warn('----- constructor -- VModule ------');
    }

}
