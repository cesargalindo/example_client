import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { NavigationModule } from '../../navigation/navigation.module';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

import { ProfileEditComponent } from './profile-edit';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CustomMaterialModule,
        ServicesGlobalModule,
        NavigationModule,
        RouterModule.forChild([{
            path: '', component: ProfileEditComponent,
        }])
    ],
    declarations: [
        ProfileEditComponent,
    ]
})
export class ProfileEditModule {

    constructor() {
        console.warn('----- constructor -- EmailLinkModule ------');
    }

}
