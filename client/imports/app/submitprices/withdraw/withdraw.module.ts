import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { WithdrawComponent } from './withdraw';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{
            path: '', component: WithdrawComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule
    ],
    declarations: [
        WithdrawComponent,
    ]
})
export class WithdrawModule {

    constructor() {
        console.warn('----- constructor -- WithdrawModule ------');
    }

}
