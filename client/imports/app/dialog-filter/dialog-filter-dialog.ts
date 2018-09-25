import { Component } from '@angular/core';
import { OnInit, NgZone } from '@angular/core';
import { CacheStateService } from '../services-global/CacheStateService';
import { SearchHistoryService } from '../services-global/SearchHistoryService';

import { Snapshots } from '../../../../both/collections/snapshots.local.collection';

import template from './dialog-filter-dialog.html';

@Component({
    selector: 'dialog-filter-dialog',
    template,
})
export class DialogFilterDialogComponent implements OnInit  {

    request_ss: string = 'REQUEST-SEARCH-SETTINGS';

    selectSize: boolean;
    selectedRadio: string;

    sizeList = [
        { value: 1, viewValue: '1' },
        { value: 2, viewValue: '2' },
        { value: 3, viewValue: '3' },
        { value: 4, viewValue: '4' },
        { value: 5, viewValue: '5' },
        { value: 6, viewValue: '6' },
        { value: 7, viewValue: '7' },
        { value: 8, viewValue: '8' },
        { value: 9, viewValue: '9' },
        { value: 10, viewValue: '10' },
        { value: 12, viewValue: '12' },
        { value: 16, viewValue: '16' },
        { value: 20, viewValue: '20' },
        { value: 24, viewValue: '24' },
        { value: 36, viewValue: '36' },
        { value: 60, viewValue: '60' },
        { value: 80, viewValue: '80' },
        { value: 120, viewValue: '120' },
        { value: 200, viewValue: '200' },
    ];
    sizeValue: number;


    unitsList = [
        { value: '-c-', viewValue: '___COUNT___' },
        { value: 'ct', viewValue: 'count (ct)' },
        { value: '-w-', viewValue: '___WEIGHT___' },
        { value: 'kg', viewValue: 'kilograms (kg)' },
        { value: 'lb', viewValue: 'pounds (lb)' },
        { value: 'oz', viewValue: 'ounces (oz)' },        
        { value: 'gm', viewValue: 'grams (gm)' },
        { value: '-v-', viewValue: '___VOLUME___' },
        { value: 'gal', viewValue: 'gallons (gal)' },
        { value: 'lt', viewValue: 'liters (lt)' },
        { value: 'qt', viewValue: 'quarts (qt)' },
        { value: 'pt', viewValue: 'pints (pt)' },
        { value: 'fl oz', viewValue: 'fl ounces (fl oz)' },
        { value: 'ml', viewValue: 'milliliters (ml)' },
    ];
    unitsValue: string;


    constructor(
        public _searchHistory: SearchHistoryService,
        private _ngZone: NgZone) {}


    ngOnInit() {
        let searchFilter = this._searchHistory.getHistory("searchQuery_filter");

        if (searchFilter.restrictTo == 'count') {
            this.unitsList = [
                { value: 'ct', viewValue: 'count (ct)' },
            ];
            this.unitsValue = 'ct';
        }
        else if (searchFilter.restrictTo == 'weight') {
            this.unitsList = [
                { value: 'kg', viewValue: 'kilograms (kg)' },
                { value: 'lb', viewValue: 'pounds (lb)' },
                { value: 'oz', viewValue: 'ounces (oz)' },        
                { value: 'gm', viewValue: 'grams (gm)' },
            ];
            this.unitsValue = 'kg';            
        }
        else if (searchFilter.restrictTo == 'volume') {
            this.unitsList = [
                { value: 'gal', viewValue: 'gallons (gal)' },
                { value: 'lt', viewValue: 'liters (lt)' },
                { value: 'qt', viewValue: 'quarts (qt)' },
                { value: 'pt', viewValue: 'pints (pt)' },
                { value: 'fl oz', viewValue: 'fl ounces (fl oz)' },
                { value: 'ml', viewValue: 'milliliters (ml)' },
            ];
            this.unitsValue = 'gal';            
        }

        this.selectedRadio = searchFilter.operator;

        if (this.selectedRadio == 'all') {
            this.selectSize = false;
        }
        else {
            this.selectSize = true;            
        }

        this.sizeValue = searchFilter.size;

        if (_.where(this.unitsList, {value: searchFilter.unit}).length) {
            // selected unit exists in array - use that
            this.unitsValue = searchFilter.unit;            
        }
    }

    /**
     * @param selected 
     */
    radioSelected(selected) {
        this._ngZone.run(() => { // run inside Angular2 world
            this.selectedRadio = selected;

            if (this.selectedRadio == 'all') {
                this.selectSize = false;
            }
            else {
                this.selectSize = true;            
            }
        });
    }

    /**
     * @param unit 
     */
    onChange(unit) {
        this._ngZone.run(() => { // run inside Angular2 world
        
            console.log(unit + ' -- ' + this.unitsValue);
            if (this.unitsValue == '-c-') {
                this.unitsValue = 'ct';
            }
            else if (this.unitsValue == '-w-') {
                this.unitsValue = 'lb';
            }
            else if (this.unitsValue == '-v-') {
                this.unitsValue = 'gal';
            }
            console.log(unit + ' == ' + this.unitsValue);
            
        });

    }

    closedDialog() {
        this._searchHistory.addItem("searchQuery_filter", {
            operator: this.selectedRadio,
            size: this.sizeValue,
            unit: this.unitsValue,
        });


        // Fire off a rerun of search
        Snapshots.update(this.request_ss, {
            $set: {
                'reRunSearch': true,
            }
        });
    }


}

