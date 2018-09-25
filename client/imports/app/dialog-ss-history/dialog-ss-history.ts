import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

import template from './dialog-ss-history.html';

import { DialogSSHistoryDialog } from './dialog-ss-history-dialog';

@Component({
  selector: 'dialog-ss-history',
  template
})
export class DialogSSHistory {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    // close all other diablogs
    this.dialog.closeAll();

    this.dialog.open(DialogSSHistoryDialog, {
      height: window.innerHeight  + 'px',
      width:  window.innerWidth + 'px'
    });
  }
}

