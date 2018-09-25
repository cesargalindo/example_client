import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';


import template from './dialog-store-history.html';

import { DialogStoreHistoryDialog } from './dialog-store-history-dialog';

@Component({
  selector: 'dialog-store-history',
  template
})
export class DialogStoreHistory {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    // close all other diablogs
    this.dialog.closeAll();

    this.dialog.open(DialogStoreHistoryDialog, {
      height: window.innerHeight  + 'px',
      width:  window.innerWidth + 'px'
    });
  }
}

