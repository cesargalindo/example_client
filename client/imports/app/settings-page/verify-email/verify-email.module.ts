import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { VerifyEmailComponent } from './verify-email';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{
            path: '', component: VerifyEmailComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule
    ],
    declarations: [
        VerifyEmailComponent
    ]
})
export class VerifyEmailModule {

    constructor() {
        console.warn('----- constructor -- VerifyEmailModule ------');
    }

}
