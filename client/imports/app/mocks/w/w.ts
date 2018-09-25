import { Component, OnInit } from "@angular/core";

import { VariablesService } from '../../services-global/VariablesService';

import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

import template from "./w.html";
import style from './w.scss';

@Component({
    selector: "w",
    template,
    styles: [ style ],
})
export class WComponent implements OnInit {
    stateCtrl: FormControl;
    filteredStates: Observable<any[]>;
  
    states: any[] = [
      {
        name: 'Arkansas',
        population: '2.978M',
        // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
        flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg'
      },
      {
        name: 'California',
        population: '39.14M',
        // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
        flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg'
      },
      {
        name: 'Florida',
        population: '20.27M',
        // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
        flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg'
      },
      {
        name: 'Texas',
        population: '27.47M',
        // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
        flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg'
      }
    ];

    constructor(public _varsService: VariablesService) { 
        this.stateCtrl = new FormControl();
        this.filteredStates = this.stateCtrl.valueChanges
            .startWith(null)
            .map(state => state ? this.filterStates(state) : this.states.slice());
    }

    ngOnInit() { }

    filterStates(name: string) {
        return this.states.filter(state =>
          state.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }

    check123(x) {
        alert('thumbs up... ' + x);
    }

    check555(x) {
        alert('thumbs up... ' + x);
    }
}
