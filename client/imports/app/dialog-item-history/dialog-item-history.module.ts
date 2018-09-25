import { NgModule, ModuleWithProviders } from '@angular/core';
import { CustomMaterialModule } from "../custom-material/custom-material.module";

import { CommonModule } from '@angular/common';

import { DialogItemHistory } from './dialog-item-history';
import { DialogItemHistoryDialog } from './dialog-item-history-dialog';
import { ServicesGlobalModule } from '../services-global/services-global.module';

@NgModule({
    imports: [
        CommonModule,
        CustomMaterialModule,
        ServicesGlobalModule
    ],
    declarations: [ DialogItemHistory, DialogItemHistoryDialog ],
    exports: [ DialogItemHistory, DialogItemHistoryDialog ],
    entryComponents: [
        DialogItemHistoryDialog
    ],
})
export class DialogItemHistoryModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DialogItemHistoryModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- DialogItemHistoryModule ------');
    }
}