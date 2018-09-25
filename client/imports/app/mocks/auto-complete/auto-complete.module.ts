import { NgModule } from '@angular/core';
import {FormControl} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';

import { AutoComplete } from './auto-complete';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        RouterModule.forChild([{
            path: '', component: AutoComplete,
        }]),
        CustomMaterialModule,
        NavigationModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        AutoComplete
    ]
})
export class AutoCompleteModule {



    constructor() {
        console.warn('----- constructor -- AutoCompleteModule ------');
    }

}
