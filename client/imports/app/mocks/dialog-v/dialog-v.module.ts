import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApolloXModule } from '../../apollo/apollo.module'
import { CustomMaterialModule } from "../../custom-material/custom-material.module";
import { ServicesGlobalModule } from '../../services-global/services-global.module';
import { ServicesModule } from '../../services/services.module';


import { DialogV } from './dialog-v';
import { DialogVDialog } from './dialog-v-dialog';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ApolloXModule,
        CustomMaterialModule,
        ServicesGlobalModule,
        ServicesModule
    ],
    declarations: [ DialogV, DialogVDialog ],
    exports: [ DialogV, DialogVDialog ],
    entryComponents: [
        DialogVDialog
    ],
})
export class DialogVModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DialogVModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- DialogVModule ------');
    }
}