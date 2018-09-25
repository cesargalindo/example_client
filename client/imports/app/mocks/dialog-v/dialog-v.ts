import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { DialogVDialog } from './dialog-v-dialog';

import template from './dialog-v.html';

@Component({
  selector: 'dialog-v',
  template
})
export class DialogV implements OnInit{

  adjustHeight: number;
  adjustWidth: number;

  constructor(
      public dialog: MatDialog) { }


  ngOnInit() { }


  openDialog(step) {
    // close all other diablogs
    this.dialog.closeAll();

    this.adjustHeight = Math.round(window.innerHeight * 0.9);
    this.adjustWidth = Math.round(window.innerWidth * 0.9);

    this.dialog.open(DialogVDialog, {
      height: this.adjustHeight   + 'px',
      width:  this.adjustWidth + 'px',
      data: { name: 'austin', step3: step },
    });
  }
}

