import { NgModule, ModuleWithProviders } from '@angular/core';
import { CustomMaterialModule } from "../custom-material/custom-material.module";

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ApolloModule } from 'angular2-apollo';
import { client } from '../client';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CustomMaterialModule,
        ApolloModule.withClient(client)
    ],
})
export class ApolloXModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ApolloXModule,
        };
    }

    constructor() {
        console.warn('----- constructor -- ApolloXModule ------');
    }
}