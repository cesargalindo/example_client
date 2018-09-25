import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';

import { MocksComponent } from './mocks';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        RouterModule.forChild([{
            path: '', component: MocksComponent,
        }]),
        CustomMaterialModule,
        NavigationModule
    ],
    declarations: [
        MocksComponent
    ]
})
export class MocksModule {

    constructor() {
        console.warn('----- constructor -- MocksModule ------');
    }

}
