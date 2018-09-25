import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Ng2PaginationModule } from 'ng2-pagination';
import { CommonModule } from '@angular/common';

import { ApolloXModule } from '../apollo/apollo.module';

import { CustomMaterialModule } from "../custom-material/custom-material.module";
import { NavigationModule } from '../navigation/navigation.module';

import { FavoritesComponent } from './favorites';

@NgModule({
    imports: [
        Ng2PaginationModule,
        CommonModule,
        RouterModule.forChild([{
            path: '', component: FavoritesComponent,
        }]),
        CustomMaterialModule,
        NavigationModule,
        ApolloXModule,
    ],
    declarations: [
        FavoritesComponent
    ]
})
export class FavoritesModule {

    constructor() {
        console.warn('----- constructor -- FavoritesModule ------');
    }

}
