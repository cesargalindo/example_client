import { NgModule } from '@angular/core';
import { SubmitpricesService } from './submitprices-service';

import { ServicesGlobalModule } from '../../services-global/services-global.module';

@NgModule({
    imports: [ServicesGlobalModule],
    providers: [SubmitpricesService]
})
export class SubmitpricesServiceModule { }