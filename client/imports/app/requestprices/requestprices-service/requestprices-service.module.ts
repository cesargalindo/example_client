import { NgModule } from '@angular/core';
import { RequestpricesService } from './requestprices-service';
import { ServicesGlobalModule } from '../../services-global/services-global.module';

@NgModule({
    imports: [ServicesGlobalModule],
    providers: [RequestpricesService]
})
export class RequestpricesServiceModule {}