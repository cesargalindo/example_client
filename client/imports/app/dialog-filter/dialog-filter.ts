import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';


import template from './dialog-filter.html';

import { DialogFilterDialogComponent } from './dialog-filter-dialog';

@Component({
  selector: 'dialog-filter',
  template
})
export class DialogFilterComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(DialogFilterDialogComponent, {
      height: window.innerHeight  + 'px',
      width:  window.innerWidth + 'px'
    });
  }
}

