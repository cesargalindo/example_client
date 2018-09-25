import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CustomMaterialModule } from "../custom-material/custom-material.module";

import { DialogStoreHistory } from './dialog-store-history';
import { DialogStoreHistoryDialog } from './dialog-store-history-dialog';
import { ServicesGlobalModule } from '../services-global/services-global.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        CustomMaterialModule,
        ServicesGlobalModule
    ],
    declarations: [ DialogStoreHistory, DialogStoreHistoryDialog ],
    exports: [ DialogStoreHistory, DialogStoreHistoryDialog ],
    entryComponents: [
        DialogStoreHistoryDialog
    ],
})
export class DialogStoreHistoryModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DialogStoreHistoryModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- DialogStoreHistoryModule ------');
    }
}