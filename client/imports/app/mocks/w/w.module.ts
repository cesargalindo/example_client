import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';

import { WComponent } from './w';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: WComponent,
        }]),
        CustomMaterialModule,
        NavigationModule
    ],
    declarations: [
        WComponent
    ]
})
export class WModule {

    constructor() {
        console.warn('----- constructor -- WModule ------');
    }

}
