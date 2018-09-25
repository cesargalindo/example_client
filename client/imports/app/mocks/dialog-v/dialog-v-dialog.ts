import { Component,  NgZone, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Angular2Apollo, ApolloQueryObservable } from 'angular2-apollo';

import { SearchHistoryService } from '../../services-global/SearchHistoryService';
import { VariablesService } from '../../services-global/VariablesService';
import { ValidatorsService } from '../../services/ValidatorService';
import { SnackbarService } from '../../services/SnackbarService';

import {MAT_DIALOG_DATA} from '@angular/material';

import { Snapshots } from '../../../../../both/collections/snapshots.local.collection';

import gql from 'graphql-tag';

import template from './dialog-v-dialog.html';

@Component({
    selector: 'dialog-v-dialog',
    template,
})
export class DialogVDialog implements OnInit {

    // 1 = wrong_price 
    // 2 = wrong_desc 
    // 3 = wrong_image 
    // 4 = not_fulfilled
    checkboxValue: number; 

    step_1: boolean = true;
    step_2: number = 0;
    step_3: boolean = false;
    
    submitPriceForm: FormGroup;
    stores: Array<any>;
    clearStoreField: string;
    // paceHolderStoreName: string;
    soldOut: boolean = false;
    

    updateItemInfoForm: FormGroup;
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
    // unitsValue: string;
    ctSelected: boolean;    

    labels: Object;
    errors: Object;
    msgs: Object;

    apolloItem1: ApolloQueryObservable<any>;
    
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public _snackbar: SnackbarService,                
        private apollo: Angular2Apollo,        
        private _ngZone: NgZone,        
        public _varsService: VariablesService,  
        private _validatorsService: ValidatorsService,        
        private formBuilder: FormBuilder,        
        public _searchHistory: SearchHistoryService) { }


    ngOnInit() {
        this.labels = this._varsService.labels;
        this.errors = this._varsService.errors;
        this.msgs = this._varsService.msgs;

        if (this.data.step3) {
            this.step_1 = false;
            this.step_3 = true;
        }

        let searchFilter = this._searchHistory.getHistory("searchQuery_filter");
        console.warn(searchFilter);

        // if (searchFilter.restrictTo == 'count') {
        //     this.unitsList = [
        //         { value: 'ct', viewValue: 'count (ct)' },
        //     ];
        //     this.unitsValue = 'ct';
        //     this.ctSelected = true;
        // }
        // else if (searchFilter.restrictTo == 'weight') {
        //     this.unitsList = [
        //         { value: 'kg', viewValue: 'kilograms (kg)' },
        //         { value: 'lb', viewValue: 'pounds (lb)' },
        //         { value: 'oz', viewValue: 'ounces (oz)' },        
        //         { value: 'gm', viewValue: 'grams (gm)' },
        //     ];
        //     this.unitsValue = 'kg';
        //     this.ctSelected = false;            
        // }
        // else if (searchFilter.restrictTo == 'volume') {
        //     this.unitsList = [
        //         { value: 'gal', viewValue: 'gallons (gal)' },
        //         { value: 'lt', viewValue: 'liters (lt)' },
        //         { value: 'qt', viewValue: 'quarts (qt)' },
        //         { value: 'pt', viewValue: 'pints (pt)' },
        //         { value: 'fl oz', viewValue: 'fl ounces (fl oz)' },
        //         { value: 'ml', viewValue: 'milliliters (ml)' },
        //     ];
        //     this.unitsValue = 'gal';
        //     this.ctSelected = false;            
        // }


        // this.paceHolderStoreName = 'Foo Foo Poo ';
        this.submitPriceForm = this.formBuilder.group({
            price: ['', [ this._validatorsService.isValidNumber, this._validatorsService.isValidPrice ]],
            soldOut: ['']
        });


        this.updateItemInfoForm = this.formBuilder.group({
            itemSize: [''],
            itemUnit: ['oz', Validators.required],
            itemName: ['', this._validatorsService.isValidItemName ],
        });

    }


    submitForm1() {
        alert(this.submitPriceForm.value.price + '  priceId=' + this._varsService.selectedPriceId + ' -- ' + this.soldOut);
        
        if (this.submitPriceForm.valid) {
            // Submit new price
            Meteor.call('simplified.price.submit', this._varsService.selectedPriceId, parseFloat(this.submitPriceForm.value.price), this.soldOut, (err, res) => {
                if (err) {
                    console.log(err);
                    alert(err);
                }
                else {
                    console.log(res);
                    alert('passed');
                    document.getElementById('forceCloseClick').click();                    
                }
            });
        }
        else {
            // Process Form Errors
            let validateFields = {};
            validateFields['price'] = 1;
            this.errors = this._varsService.processFormControlErrors(this.submitPriceForm.controls, validateFields);

            // We have an error, stay on form...
            return;
        }

    }

    clickSoldOut() {
        if (this.submitPriceForm.value.soldOut) {
            // Actual price value doesn't matter - it will be overwritten based on soldOut field
            this.submitPriceForm.patchValue({price: 1});
            this.soldOut = true;
        }
        else {
            this.submitPriceForm.patchValue({price: ''});
            this.soldOut = false;
        }
    }


    checkboxSelected(val) {
        this.step_1 = false;
        this.step_2 = val;

        // retreive item info
        if (val == 2) {
            this._ngZone.run(() => { // run inside Angular2 world
                this.apolloItem1 = this.apollo.watchQuery({
                    query: gql`
                        query MyItems1($id: String) {
                            apItem(id: $id) {
                                    _id
                                name
                                size
                                unit
                                quantity
                                image
                                public
                                note
                                owner
                                status
                                created
                            }
                        }
                    `,
                    variables: {
                        id: this._varsService.selectedItemId,
                    },
                    forceFetch: true
                })
                    .map( ({ data }) => {
                        console.warn('######## THE DATA ####### ' +  data.apItem.name);
                        console.warn(data.apItem);
                        this.updateItemInfoForm.patchValue({
                            itemName: data.apItem.name,
                            itemSize: data.apItem.size,
                            itemUnit: data.apItem.unit
                        });

                        // this.unitsValue = data.apItem.unit;
                        // this.ctSelected = false;  

                        return data.apItem;
                    });
            });
        }
    }


    /**
     * Update item name, size and units
     * 
     */
    submitForm2(){
        alert(this._varsService.selectedItemId + ' -- ' + this.updateItemInfoForm.value.itemName  + ' -- ' + this.updateItemInfoForm.value.itemSize  + ' -- ' + this.updateItemInfoForm.value.itemUnit);

        if (this.updateItemInfoForm.valid) {
            // Submit new price
            Meteor.call('simplified.item.update', this._varsService.selectedItemId, this.updateItemInfoForm.value.itemName, parseFloat(this.updateItemInfoForm.value.itemSize), this.updateItemInfoForm.value.itemUnit, (err, res) => {
                if (err) {
                    console.log(err);
                    alert(err);
                }
                else {
                    console.log(res);
                    alert('passed');
                    document.getElementById('forceCloseClick').click();                    
                }
            });
        }
        else {
            // Process Form Errors
            let validateFields = {};
            validateFields['itemName'] = 1;
            this.errors = this._varsService.processFormControlErrors(this.updateItemInfoForm.controls, validateFields);

            // We have an error, stay on form...
            return;
        }

    }


    onChangeUnits(unit) {
        this._ngZone.run(() => { // run inside Angular2 world
            if (unit == '-c-') {
                this.updateItemInfoForm.patchValue({
                    itemUnit: 'ct'
                });
                this.ctSelected = true;
            }
            else if (unit == 'ct') {
                this.ctSelected = true;                
            }            
            else if (unit == '-w-') {
                this.updateItemInfoForm.patchValue({
                    itemUnit: 'oz'
                });
                this.ctSelected = false;
            }
            else if (unit == '-v-') {
                this.updateItemInfoForm.patchValue({
                    itemUnit: 'gal'
                });
                this.ctSelected = false;
            }
            else {
                this.ctSelected = false;
            }
        });
    }

    warp1() {
        this._snackbar.displaySnackbar(3);
    }
}
