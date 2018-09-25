import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Ledgers } from "../../../../both/collections/ledgers.collections";
import { MeteorObservable } from 'meteor-rxjs';

@Injectable()
export class UserService {

    score: number;
    downVotes: number;
    upVotes: number;
    thumbsUp: Object = {};
    thumbsDown: Object = {};

    reactiveRanking: Subject<Object> = new Subject<Object>();

    userProfile: Object = {};
    cellVerified: boolean;

    userRequests: number;
    userBalance: number;
    userPendingRequests: number;
    userPendingSubmits: number;
    totalBalance: number;

    withdrawalStatus: number;
    submitStatus: number;
    requestStatus: number;
    
    payRequestDefault: number;
    payRequestMax: number;
    minHoursDefault: number;
    minHoursMax: number;
    quantityDefault: number;
    quantityMax: number;

    constructor( private _ngZone: NgZone) { }


    /**
     * Used by Admin server
     */
    userEmailSearch(term: string) {

        return new Observable.create(observer => {

            if (term) {
                // ensure search term is greater than 1 characters..
                if (term.length < 2) {
                    let nada = [ ];
                    observer.next(nada);
                    observer.complete();
                }
                else {
                    Meteor.call('getUserEmails', term, (error, res) => {

                        this._ngZone.run(() => {
                            if (error) {
                                throw error;
                            }
                            else {
                                // works instantly with ngZone
                                observer.next(res);
                                observer.complete();
                            }
                        });

                    });
                }
            }
            else {
                let nada = [ ];
                observer.next(nada);
                observer.complete();
            }
        });
    }


    /**
     * User Rankings info
     * WithdrawStatus, submitStatus, requestStatus
     *
     */
    initializeUserInfo(override) {

        if ( (!this.score) || (override)) {
            // No need to subscribe to "mybalance" again
            if (!this.score) {
                MeteorObservable.subscribe('mybalance').zone().subscribe(x => {
                    this._ngZone.run(() => {
                        Ledgers.find( {}, { balance: 1, requests: 1 } ).subscribe(y => {
                            if (y.length) {
                                if ( isNaN(y[0].requests) ) {
                                    this.userRequests = 0;
                                }
                                else {
                                    this.userRequests = y[0].requests;
                                }
                                // convert balances to cents
                                this.userBalance = y[0].balance * 0.01;
                                this.userPendingRequests = y[0].pendingRequests * 0.01;
                                this.userPendingSubmits = y[0].pendingSubmits * 0.01;
                                this.totalBalance = this.userBalance + this.userPendingSubmits + this.userPendingRequests;
                            }
                            else {
                                this.userRequests = 0;
                                this.userBalance = 0;
                                this.userPendingRequests = 0;
                                this.userPendingSubmits = 0;
                                this.totalBalance = 0;
                            }
                        })
                    });                        
                });
            }


            let tmpObv = new Observable.create(observer => {
                // Elasticsearch call must reside in server...
                Meteor.call('loadInitialUserData', (error, res) => {
                    this._ngZone.run(() => {

                        if (error) {
                            throw error;

                        } else {
                            observer.next(res);
                            observer.complete();
                        }
                    });
                });
            }).first();


            tmpObv.subscribe(x => {
                if (x.status) {
                    this.withdrawalStatus = x.data.withdrawalStatus;
                    this.submitStatus = x.data.submitStatus;
                    this.requestStatus = x.data.requestStatus;
                    console.log(this.withdrawalStatus + ' - ' + this.submitStatus + ' - ' +  this.requestStatus);

                    this.payRequestDefault = x.data.settings.payRequestDefault;
                    this.payRequestMax = x.data.settings.payRequestMax;
                    this.minHoursDefault = x.data.settings.minHoursDefault;
                    this.minHoursMax = x.data.settings.minHoursMax;
                    this.quantityDefault = x.data.settings.quantityDefault;
                    this.quantityMax = x.data.settings.quantityMax;

                    this.userProfile.firstname = '';
                    this.userProfile.lastname = '';
                    if ( x.data.userProfile != null) {
                        if (x.data.userProfile.hasOwnProperty('firstname')) {
                            this.userProfile.firstname = x.data.userProfile.firstname;
                        }
                        if (x.data.userProfile.hasOwnProperty('lastname')) {
                            this.userProfile.lastname = x.data.userProfile.lastname;
                        }
                    }
                    console.log(this.userProfile);

                    this.cellVerified = x.data.cellVerified;

                    this.thumbsUp = JSON.parse(x.data.ranking.thumbsUp);
                    this.thumbsDown = JSON.parse(x.data.ranking.thumbsDown);

                    // process this last - leverage reactivity for other elements
                    this.downVotes = x.data.ranking.downVotes;
                    this.upVotes = x.data.ranking.upVotes;
                    this.generateScore(this.downVotes,  this.upVotes);
                }

                console.log(x);
            });

        }
    }



    /**
     * 10 upvotes are provided to every user by default
     * if user gets a downvote and has a minimum of 5 submitted prices (10 + 5) - user's account is locked
     * user must have a score of 3.5 or greater to be able to submit prices
     * when user is blocked, he/she must request 5 prices to unlock their account
     *
     */
    generateScore (downvotes, upvotes) {

        if ( (downvotes) && (upvotes < 16) ) {
            this.score = 0;
        }
        else if (downvotes < 3) {
            this.score = 5 * (upvotes + downvotes) / (downvotes * 2 + upvotes);
        }
        else if (downvotes < 5) {
            this.score = 5 * (upvotes + downvotes) / (downvotes * 3 + upvotes);
        }
        else if (downvotes < 7) {
            this.score = 5 * (upvotes + downvotes) / (downvotes * 4 + upvotes);
        }
        else if (downvotes < 9) {
            this.score = 5 * (upvotes + downvotes) / (downvotes * 5 + upvotes);
        }
        else if (downvotes < 12) {
            this.score = 5 * (upvotes + downvotes) / (downvotes * 6 + upvotes);
        }
        else if (downvotes < 15) {
            this.score = 5 * (upvotes + downvotes) / (downvotes * 7 + upvotes);
        }
        else if (downvotes > 14) {
            this.score = 5 * (upvotes + downvotes) / (downvotes * 8 + upvotes);
        }
        else {
            this.score = 5 * (upvotes + downvotes) / (downvotes + upvotes);
        }

        // this.score = Math.round( this.score * 100) / 100;

        this.reactiveRanking.next({
            score: this.score,
        });
    }


    getReactiveRanking() {
        return this.reactiveRanking;
    }



    thumbsUpClicked(price) {

        return new Observable.create(observer => {

            Meteor.call('user.thumbsUpClicked', price, (error, res) => {

                // this._ngZone.run(() => {

                    if (error) {
                        throw error;

                    } else {
                        console.log("==========>>>> user.thumbsUpClicked successfully returned from Elasticsearch method call.. !!!!!!!!!!!!!");
                        console.log(res);

                        observer.next(res);
                        observer.complete();
                    }

                // });

            });

        });

    }


}

