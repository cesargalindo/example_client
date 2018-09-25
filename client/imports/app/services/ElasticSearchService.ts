import { Injectable, NgZone } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/withLatestFrom';

import { ElasticParams } from '../../../../both/models/helper.models';

@Injectable()
export class ElasticSearchService {

    public ss1_gunit: string;

    constructor(private _ngZone: NgZone) { }

    /**
     *
     */
    elasticSearch_ss1(term: string) {
        // http://stackoverflow.com/questions/33675155/creating-and-returning-observable-from-angular-2-service

        return new Observable.create(observer => {

            // ensure search term is greater than 2 characters before sending to server
            if (term.length < 3) {
                let nada = [ ];
                observer.next(nada);
                observer.complete();
            }
            else {
                // ss -  Elasticsearch call must reside in server...
                Meteor.call('ss1Search', term, (error, res) => {

                    this._ngZone.run(() => {

                        if (error) {
                            console.error(error);
                            throw error;

                        } else {
                            if (res.length) {
                                this.ss1_gunit = _.first( res ).gunit;                                
                            }

                            // works instantly with ngZone
                            observer.next(res);
                            observer.complete();

                        }
                    });

                });
            }
        });
    }


    /**
     *  Ideally this service should exist on server so we don't have to return data to client
     *  However, data set if very small, just an array of ids. Most likely negligible...
     * 
    * @param eParams 
    */
    elasticSearch_ss2(eParams: ElasticParams) {

        return new Observable.create(observer => {

            if (eParams.searchType == 'Stores near') {
                if (eParams.name == null) {
                    if (eParams.operator == 'all') {
                        eParams.type = '2a';
                    }
                    else {
                        eParams.type = '2b';
                    }
                }
                else {
                    if (eParams.operator == 'all') {
                        eParams.type = '2c';
                    }
                    else {
                        eParams.type = '2d';
                    }
                }
            }
            else {
                alert('ERROR: Store query is no longer supported');
            }

            Meteor.call('ss2_Search', eParams, (error, res) => {

                this._ngZone.run(() => {

                    if (error) {
                        throw error;

                    } else {
                        console.log("==========>>>> ss2_Search successfully returned from Elasticsearch method call.. !!!!!!!!!!!!!");
                        console.log(res);

                        observer.next(res);
                        observer.complete();
                    }

                });

            });

        });

    }



    /**
     * User selected single item - returns search results for that item
     * 
     */
    elasticSearch_ss3(eParams: ElasticParams) {

        return new Observable.create(observer => {

            if (eParams.searchType == 'Store') {

                if (eParams.name == null) {
                    if (eParams.operator == 'all') {
                        eParams.type = '3e';
                    }
                    else {
                        alert ('ERROR 22: invalid operator provided...');
                        return;
                    }
                }
                else {
                    if (eParams.operator == 'all') {
                        eParams.type = '3g';
                    }
                    else {
                        alert ('ERROR 23: invalid operator provided...');
                        return;
                    }
                }
            }

            Meteor.call('ss3_Search', eParams, (error, res) => {

                this._ngZone.run(() => {

                    if (error) {
                        throw error;

                    } else {
                        observer.next(res);
                        observer.complete();
                    }

                });

            });

        });

    }

    /**
     * A dupicate copy of this function also reside on server code
     * 
     * 1 lb	--> 16 oz
     * 1 kg	-->  35.274 oz
     * 1 gm	--> 0.035274 oz
     * 
     * 1 gal --> 128 fl oz
     * 1 lt	--> 33.814 fl oz
     * 1 qt	--> 32 fl oz
     * 1 pt	--> 16 fl oz
     * 1 cup --> 8 fl oz
     * 1 ml --> 0.033814 fl oz
     * 
    */
    getGlobalSize(size: number, unit: string) {
        let gsize = 0;
        let gunit = '';

        // WEIGHT
        if (unit == 'lb') {
            gsize = size * 16;
            gunit = 'oz';
        }
        else if (unit == 'kg') {
            gsize = size * 35.274;
            gunit = 'oz';
        }
        else if (unit == 'gm') {
            gsize = size * 0.035274;
            gunit = 'oz';
        }
        else if (unit == 'oz') {
            gsize = size;
            gunit = 'oz';
        }
        // VOLUME
        else if (unit == 'gal') {
            gsize = size * 128;
            gunit = 'fl oz';
        }
        else if (unit == 'lt') {
            gsize = size * 33.814;
            gunit = 'fl oz';
        }
        else if (unit == 'qt') {
            gsize = size * 32;
            gunit = 'fl oz';
        }
        else if (unit == 'pt') {
            gsize = size * 16;
            gunit = 'fl oz';
        }
        else if (unit == 'cup') {
            gsize = size * 8;
            gunit = 'ml';
        }
        else if (unit == 'fl oz') {
            gsize = size;
            gunit = 'fl oz';
        }
        else if (unit == 'ml') {
            gsize = size * 0.033814;
            gunit = 'ml';
        }
        else if (unit == 'ct') {
            gsize = size;
            gunit = 'ct';
        }

        return {
            gsize: gsize,
            gunit: gunit
        }
    }


}

