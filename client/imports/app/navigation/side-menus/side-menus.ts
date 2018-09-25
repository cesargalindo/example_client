import { Meteor } from 'meteor/meteor';
import { Component, OnInit }   from '@angular/core';
import { Router }  from '@angular/router';
import { AuthService } from '../../services-global/auth/auth.service';
import { Observable } from 'rxjs/Observable';

import template from './side-menus.html';

@Component({
    selector: 'side-menus',
    template
})
export class SideMenusComponent implements OnInit {
    isAdmin: boolean;
    isLoggedIn: boolean;

    constructor(public authService: AuthService,
                private router: Router) { }

    ngOnInit() {
        if (this.authService.isAdmin == undefined) {
            // Check every 0.3 seconds if isAdmin has been set, after 12 seconds stop timer subscription with take(40)
            let timer = Observable
                .timer(300,300)
                .take(40)
                .subscribe( t => {
                    console.log('Timer count: ' + t + ' isadmin= ' + this.authService.isAdmin);
                    if (this.authService.isAdmin != undefined) {
                        this.isLoggedIn = this.authService.isLoggedIn;
                        this.isAdmin = this.authService.isAdmin;
                        timer.unsubscribe();
                    }
                });
        }
        else {
            this.isLoggedIn = this.authService.isLoggedIn;
            this.isAdmin = this.authService.isAdmin;
        }


        // Monitor reactiveLogin using an Observable subject
        let reactiveLogin  =  this.authService.getReactiveLogin();
        reactiveLogin.subscribe(x => {
            if (x) {
                this.isLoggedIn = true;
            }
            else {
                this.isLoggedIn = false;
            }
        });


        // Monitor reactiveAdminLogin using an Observable subject
        let reactiveAdminLogin  =  this.authService.getReactiveAdminLogin();
        reactiveAdminLogin.subscribe(x => {
            console.warn('=====> reactiveAdminLogin fired off in header.menus <======== ' + x);
            if (x) {
                this.isAdmin = x;
            }
            else {
                this.isAdmin = false;
            }
        });

    }


    logout() {
        Meteor.logout();
        this.authService.logout();
        this.router.navigate(['/landing']);
    }

}
