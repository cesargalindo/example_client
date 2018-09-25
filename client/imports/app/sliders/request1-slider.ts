import { Component, OnInit, NgZone, EventEmitter } from '@angular/core';
import { Router }  from '@angular/router';

import { UserService } from '../services-global/UserService';
import { SliderSettings } from '../../../../both/models/helper.models';

import template from './request1-slider.html';

@Component({
    selector: 'request1-slider',
    template,
    outputs: ['sliderData'],
    inputs: ['defaultValues'],

})
export class Request1SliderComponent implements OnInit {

    quantityDefault: number;
    quantityMax: number;
    quantityVal: number;
    quantityEnabled: boolean = false;

    s0: SliderSettings = {};
    ss: SliderSettings = {};
    sliderData: EventEmitter<SliderSettings>;
    defaultValues: Object;

    nonEditMode: boolean = true;

    constructor(
        private router: Router,
        private _ngZone: NgZone,
        public _userService: UserService)
    {
        this.sliderData = new EventEmitter();

    }

    // Default Requestprice values provided on load when editing an existing Requestprice
    ngOnChanges(changes) {
        console.warn(changes);

        if (changes.defaultValues != undefined) {

            if (changes.defaultValues.currentValue != undefined) {
                // Skip initialization by ngOnit, ngOnChanges is call before ngOnit
                // ngOnChanges is only called by Edit Request pages
                this.nonEditMode = false;

                if (changes.defaultValues.currentValue.quantity == undefined) {
                    this.s0.quantityDefault = this._userService.quantityDefault;
                }
                else {
                    this.s0.quantityDefault = changes.defaultValues.currentValue.quantity;
                }
                this.s0.quantityMax = this.quantityMax;

                // User is editing and existing Price request - re-initialize default settings
                this.initializeSliderSettings(false);
            }
        }

    }


    ngOnInit() {
        // If this page is reloaded, redirect to home page to allow user credentials to load
        if (this._userService.cellVerified == undefined) {
            this.router.navigate(['/landing']);
            return;
        }

        if (this.nonEditMode) {
            // Apply initial settings to search settings object to output
            this.s0.quantityDefault = this._userService.quantityDefault;
            this.s0.quantityMax = this.quantityMax;

            this.initializeSliderSettings(true);
        }

    }


    /**
     * 
     * @param emit 
     */
    initializeSliderSettings(emit) {
        this.quantityDefault = this.s0.quantityDefault;
        this.quantityMax = this.s0.quantityMax
        this.quantityVal = this.quantityDefault;

        // Apply initial settings to search settings object to output
        this.ss.quantityDefault = this.quantityVal;
        this.ss.quantityMax = this.quantityMax;

        if (emit) {
            // Emit default values to Request form/page
            this.sliderData.emit(this.ss);
        }

    }


    quantitySlider(event) {
        this._ngZone.run(() => { // run inside Angular2 world
            this.quantityVal = event.value;
            this.ss.quantityDefault = event.value;
            this.sliderData.emit(this.ss);
        });
    }



}
