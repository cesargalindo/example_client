import { NgModule, ModuleWithProviders } from '@angular/core';
import { CustomMaterialModule } from "../custom-material/custom-material.module";

import { CommonModule } from '@angular/common';

import { DialogSSHistory } from './dialog-ss-history';
import { DialogSSHistoryDialog } from './dialog-ss-history-dialog';
import { ServicesGlobalModule } from '../services-global/services-global.module';

@NgModule({
    imports: [
        CommonModule,
        CustomMaterialModule,
        ServicesGlobalModule
    ],
    declarations: [ DialogSSHistory, DialogSSHistoryDialog ],
    exports: [ DialogSSHistory, DialogSSHistoryDialog ],
    entryComponents: [
        DialogSSHistoryDialog
    ],
})
export class DialogSSHistoryModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DialogSSHistoryModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- DialogSSHistoryModule ------');
    }
}