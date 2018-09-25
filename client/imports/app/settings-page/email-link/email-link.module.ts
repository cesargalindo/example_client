import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { EmailLinkComponent } from './email-link';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([{
            path: '', component: EmailLinkComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ServicesGlobalModule
    ],
    declarations: [
        EmailLinkComponent
    ]
})
export class EmailLinkModule {

    constructor() {
        console.warn('----- constructor -- EmailLinkModule ------');
    }

}
