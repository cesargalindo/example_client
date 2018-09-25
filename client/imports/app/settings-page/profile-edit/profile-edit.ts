import { Meteor } from 'meteor/meteor';
import { Component, OnInit }   from '@angular/core';
import { Router }  from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { UserService } from '../../services-global/UserService';
import { VariablesService } from '../../services-global/VariablesService';

import template from './profile-edit.html';

@Component({
    selector: 'profile-edit',
    template,
})
export class ProfileEditComponent implements OnInit {
    user: Meteor.User;
    profileForm: FormGroup;

    list: Object;
    display_spinner: boolean = false;
    error: string;

    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        public _varsService: VariablesService,
        public _userService: UserService) { }


    ngOnInit() {
        // ensure page starts on top on page load
        document.body.scrollTop = 0;

        // If this page is reloaded, redirect to home page to allow user credentials to load
        if (this._userService.cellVerified == undefined) {
            this.router.navigate(['/landing']);
            return;
        }

        // create activity after page has loaded to force call to ngAfterViewInit()
        let tmpObv = new Observable(observer => {
            setTimeout(() => {
                observer.next(4);
            }, 10);
        }).first();
        tmpObv.subscribe();

        this.profileForm = this.formBuilder.group({
            firstname: [''],
            lastname: ['']
        });

        this.profileForm.patchValue({
            firstname: this._userService.userProfile.firstname,
            lastname: this._userService.userProfile.lastname
        });
    }


    ngAfterViewInit() {
        // Hide top toolbar to allow buttons to be shown on top
        this._varsService.setReactiveHideToolbar(true);
    }


    EditProfileInfo() {

        if (this.nameValidator(this.profileForm.value.firstname)) {
            if (!this.nameValidator(this.profileForm.value.lastname)) {
                return;
            }
        }
        else {
            return;
        }


        this.display_spinner = true;

        // Update user profile name info
        Meteor.call('updateUserProfile', this.profileForm.value.firstname, this.profileForm.value.lastname, (error, res) => {


            if (res.status) {
                if (error) {
                    this.error = error;
                    this.display_spinner = false;
                }
                else {
                    // Force reload of UserProfile info
                    this._userService.initializeUserInfo(true);

                    let cpThis = this;

                    // delay for 1 second to give time for user profile to reload before redirecting back to profile page
                    Meteor.setTimeout(function () {
                        cpThis.display_spinner = false;
                        cpThis.router.navigate(['/profile']);
                    }, 1000);

                }
            }
            else {
                this.error = res.error;
                this.display_spinner = false;
            }

        });

    }


    nameValidator(name: string): boolean {
        if ( (name.length > 1) && (name.length < 45) ) {
            return true;
        }
        return false;
    }

}
