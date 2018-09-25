import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

import template from './dialog-item-history.html';

import { DialogItemHistoryDialog } from './dialog-item-history-dialog';

@Component({
  selector: 'dialog-item-history',
  template
})
export class DialogItemHistory {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    // close all other diablogs
    this.dialog.closeAll();

    this.dialog.open(DialogItemHistoryDialog, {
      height: window.innerHeight  + 'px',
      width:  window.innerWidth + 'px'
    });
  }
}

