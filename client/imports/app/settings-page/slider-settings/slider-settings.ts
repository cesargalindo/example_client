import { Meteor } from 'meteor/meteor';
import { Component, OnInit, NgZone }   from '@angular/core';
import { Router }  from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { UserService } from '../../services-global/UserService';
import { VariablesService } from '../../services-global/VariablesService';

import { SliderSettings } from '../../../../../both/models/helper.models';

import template from './slider-settings.html';

@Component({
    selector: 'slider-settings',
    template,
})
export class SliderSettingsComponent implements OnInit {
    user: Meteor.User;
    sliderSettingsForm: FormGroup;

    list: Object;
    display_spinner: boolean = false;
    error: string;
    successMsg: string = '';

    minHourList: Array<any>;
    minHourDefault: number;
    minHourMax: number;
    minHourVal: number;

    payRequestList: Array<any>;
    payRequestDefault: number;
    payRequestStep: number;
    payRequestMax: number;
    payRequestVal: number;
    payRequestStepValues: Object = {};

    quantityList: Array<any>;
    quantityDefault: number;
    quantityMax: number;
    quantityVal: number;

    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private _ngZone: NgZone,
        public _varsService: VariablesService,
        public _userService: UserService) { }


    ngOnInit() {
        // If this page is reloaded, redirect to home page to allow user credentials to load
        if (this._userService.cellVerified == undefined) {
            this.router.navigate(['/landing']);
            return;
        }

        this.sliderSettingsForm = this.formBuilder.group({
            minHourValue: [''],
            payRequestValue: [''],
            quantityValue: [''],
        });

        // Set initial Minutes Hours values
        this.minHourList = [
            'Minutes',
            'Hours',
        ];
        this.minHourDefault = this._userService.minHoursDefault;
        this.minHourMax = this._userService.minHoursMax;
        this.minHourVal = this.minHourDefault;

        // Set initial Payrequest values
        this.payRequestStepValues[.50] = .01;
        this.payRequestStepValues[1] = .02;
        this.payRequestStepValues[5] = .10;
        this.payRequestStepValues[10] = .25;
        this.payRequestStepValues[50] = 1;

        this.payRequestList = [
            .50,
            1,
            5,
            10,
            50,
        ];
        this.payRequestDefault = this._userService.payRequestDefault;
        this.payRequestMax = this._userService.payRequestMax;
        this.payRequestStep = this.payRequestStepValues[this.payRequestMax];
        this.payRequestVal = this.payRequestDefault;

        // Set initial Quantity values
        this.quantityList = [
            32,
            64,
        ];
        this.quantityDefault = this._userService.quantityDefault;
        this.quantityMax =  this._userService.quantityMax;
        this.quantityVal = this.quantityDefault;

        // Detect Radio button changes
        this.sliderSettingsForm.valueChanges
            .debounceTime(100)
            .distinctUntilChanged()
            .subscribe(x => {

                console.error(x);

                // Set slider info for Minutes-Hours
                if (x.minHourValue == 'Minutes') {
                    this.minHourMax = 60;
                    this.minHourDefault = this.minHourVal;
                }
                else {
                    this.minHourMax = 24;
                    if (this.minHourVal > 24) {
                        this.minHourVal = 12;
                        this.minHourDefault = 12;
                    }
                }

                // Set slider info for Quantity
                if (x.quantityValue == 64) {
                    this.quantityMax = 64;
                    this.quantityDefault = this.quantityVal;
                }
                else {
                    this.quantityMax = 32;
                    if (this.quantityVal > 32) {
                        this.quantityVal = 16;
                        this.quantityDefault = 16;
                    }
                }


                // Reset sliders settings for payRequest
                this.payRequestMax = x.payRequestValue;
                this.payRequestStep = this.payRequestStepValues[this.payRequestMax];

                // Ensure price doesn't exceed max price
                if (this.payRequestVal > this.payRequestMax) {
                    this.payRequestVal = this.payRequestMax;
                    // this.payRequestDefault = this.payRequestVal;
                }

            });


        // Set default form values on load
        if (this.minHourMax == 60) {
            this.sliderSettingsForm.patchValue({
                minHourValue: 'Minutes',
                payRequestValue: this.payRequestMax,
                quantityValue: this.quantityMax
            });
        }
        else {
            this.sliderSettingsForm.patchValue({
                minHourValue: 'Hours',
                payRequestValue: this.payRequestMax,
                quantityValue: this.quantityMax
            });
        }

    }


    /**
     * Hide top toolbar to allow buttons to be shown on top
     */
    ngAfterContentChecked() {
        // Title not visible on this page
        // this._varsService.setReactiveTitleName('EDIT SLIDER SETTINGS');
        this._varsService.setReactiveHideToolbar(true);
    }


    minHourSider(event) {
        // console.log(event);
        console.log(event.value);
        // this.payRequest = event.value * 0.01

        this.minHourVal = event.value;
    }

    payRequestSider(event) {
        console.log(event.value);
        this.payRequestVal = event.value;
    }

    quantitySlider(event) {
        // console.log(event);
        console.log(event.value);
        this.quantityVal = event.value;
    }


    saveSettingsInfo() {

        this.successMsg = '';
        this.display_spinner = true;

        let ss = <SliderSettings>{};
        ss.minHoursDefault = this.minHourVal;
        ss.minHoursMax = this.minHourMax;
        ss.payRequestDefault = Math.round(this.payRequestVal * 100) / 100;
        ss.payRequestMax = this.payRequestMax;
        ss.quantityDefault = this.quantityVal;
        ss.quantityMax = this.quantityMax;

        // Update user profile settings info
        Meteor.call('updateUserProfileSettings', ss, (error, res) => {

            this._ngZone.run(() => { // run inside Angular2 world
                if (res.status) {
                    if (error) {
                        this.error = error;
                        this.display_spinner = false;
                    }
                    else {
                        // Force reload of UserProfile info
                        this._userService.initializeUserInfo(true);

                        let cpThis = this;

                        // delay for 1.0 second to give time for user profile to reload - before user visits another page
                        Meteor.setTimeout(function () {
                            cpThis.display_spinner = false;
                            cpThis.successMsg = 'Default slider settings successfully updated.';
                        }, 1000);

                    }
                }
                else {
                    this.error = res.error;
                    this.display_spinner = false;
                }
            });

        });
    }

}
