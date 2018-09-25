import { Component } from '@angular/core';
import { SearchHistoryService } from '../services-global/SearchHistoryService';

import { Snapshots } from '../../../../both/collections/snapshots.local.collection';

import template from './dialog-ss-history-dialog.html';

@Component({
    selector: 'dialog-ss-history-dialog',
    template,
})
export class DialogSSHistoryDialog {

    private storeHistory: any;

    constructor(public _searchHistory: SearchHistoryService) {
        this.storeHistory =  this._searchHistory.getHistory("stores");
    }

    /**
     * Select store from history
     * 
     * @param store 
     */
    selectHistory(store) {
        console.log(store);

        // Use this as last store
        this._searchHistory.addItem("searchQuery_ss", store);


        Snapshots.update('SUBMIT-SEARCH-SETTINGS', {
            $set: {
                'reRunSearch': true,
            }
        });

        document.getElementById('forceCloseClick').click();
    }
}
