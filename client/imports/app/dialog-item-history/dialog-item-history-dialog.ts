import { Component } from '@angular/core';
import { SearchHistoryService } from '../services-global/SearchHistoryService';

import { Snapshots } from '../../../../both/collections/snapshots.local.collection';

import template from './dialog-item-history-dialog.html';
import style from "./dialog-item-history-dialog.scss";

@Component({
    selector: 'dialog-item-history-dialog',
    template,
    styles: [ style ],
})
export class DialogItemHistoryDialog {

    private itemHistory: any;

    constructor(public _searchHistory: SearchHistoryService) {
        this.itemHistory =  this._searchHistory.getHistory("items");
    }

    selectHistory(item) {
        console.log(item);

        if (item.id) {
            this._searchHistory.addItem("searchQuery_name", {
                name: item.name,
                id: item.id,
                searchEntry: 'select',
                ss1Gunit: item.gunit,
                sss1New: true
            });

        }
        else {
            this._searchHistory.addItem("searchQuery_name", {
                name: item.name,
                id: item.id,
                searchEntry: 'enter',
                ss1Gunit: item.gunit,
                ss1New: true
            });
        }

        Snapshots.update('REQUEST-SEARCH-SETTINGS', {
            $set: {
                'reRunSearch': true,
            }
        });

        document.getElementById('forceCloseClick').click();
    }
}
