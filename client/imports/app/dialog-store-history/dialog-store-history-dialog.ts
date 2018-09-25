import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SearchHistoryService } from '../services-global/SearchHistoryService';

import { Snapshots } from '../../../../both/collections/snapshots.local.collection';

import template from './dialog-store-history-dialog.html';

@Component({
    selector: 'dialog-store-history-dialog',
    template,
})
export class DialogStoreHistoryDialog {

    private storeHistory: any;

    constructor(
        private _router:Router,        
        public _searchHistory: SearchHistoryService) {
            this.storeHistory =  this._searchHistory.getHistory("stores");
    }


    selectHistory(store) {
        console.log(store);

        this._searchHistory.addItem("searchQuery_type", {
            searchType: 'Store',
            locationType: 'custom',
        });

        // Use this as last store
        this._searchHistory.addItem("searchQuery_store", store);

        if (this._router.url == '/sp') {
            Snapshots.update('SUBMIT-SEARCH-SETTINGS', {
                $set: {
                    'reRunSearch': true,
                }
            });
        }
        else {
            Snapshots.update('REQUEST-SEARCH-SETTINGS', {
                $set: {
                    'reRunSearch': true,
                }
            });
        }
          
        document.getElementById('forceCloseClick').click();
    }
}
