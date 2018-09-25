import { Component, EventEmitter, HostListener,  NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router }  from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { MeteorObservable } from 'meteor-rxjs';
import { Random } from 'meteor/random';

import { ElasticSearchService } from '../services/ElasticSearchService';
import { SearchHistoryService } from '../services-global/SearchHistoryService';
import { Snapshots } from '../../../../both/collections/snapshots.local.collection';

// CONTACTOR - add this to grab slider settings value to alter image quality
import { UserService } from '../services-global/UserService';
import template from './elasticsearch-ss1.html';

@Component({
    selector: 'elasticsearch-ss1',
    template,
    inputs: ['showSearchbar'],
    outputs: ['selectedSS1Item'],
})
export class ElasticSearchSS1Component implements OnInit  {
    termForm: FormGroup;
    eitems6: Observable<Array<Object>>;

    selectedSS1Item: EventEmitter<string>;

    displaySearchIcon: boolean = false;
    placeholder: string;

    myControl: FormControl = new FormControl();

    picFileName: string;
    upc: string;

    @HostListener('document:click', ['$event.target']) onClick(target) {
        if (target.id == 'ss1-searchInput-box') {
            this.displaySearchIcon = true;
        }
        else {
            this.displaySearchIcon = false;
        }
    }

    constructor(
        public _userService: UserService,
        public _searchHistory: SearchHistoryService,
        private _ngZone: NgZone,
        private formBuilder: FormBuilder,
        private elasticsearch: ElasticSearchService,
        private router: Router) {
        this.selectedSS1Item = new EventEmitter();
    }
    ngOnChanges(changes) {
      console.log(changes);
    }

    ngOnInit() {
        let searchInfo = this._searchHistory.getHistory("searchQuery_name");
        console.log(searchInfo);

        this.placeholder = searchInfo.name;

        if (searchInfo.name == undefined) {
            this.placeholder = 'Search items';
        }

        this.termForm = this.formBuilder.group({
            value: [ '' ]
        });

        this.termForm.valueChanges
            .debounceTime(300)
            .distinctUntilChanged()
            .subscribe(x => {

                this._ngZone.run(() => { // run inside Angular2 world

                    if (x.value != undefined) {
                        // this call also captures gunit of first item
                        this.eitems6 = this.elasticsearch.elasticSearch_ss1(x.value);
                    }
                    return x;

                });

            });

        // Update placeholder when dialog updates Snapshot
        MeteorObservable.autorun().subscribe(() => {

            // since I wrapped this Snapshot "Meteor" collection around an autorun() => {  .... });
            // Snapshots collection is reactive - every time it's updated while on landing page, this code will run
            Snapshots.findOne('REQUEST-SEARCH-SETTINGS');
            let queryA = this._searchHistory.getHistory('searchQuery_name');
            this.placeholder = queryA.name;

            // clear value to allow placeholder to display
            this.termForm.patchValue({value: ''});

            console.warn('queryA.name = ' + queryA.name);

        });
    }


    select(x) {
        this._searchHistory.addItem("searchQuery_name", {
            name: x.name,
            id: x.id,
            searchEntry: 'select',
            ss1Gunit: x.gunit,
            ss1New: true
        });

        // s2s - user hits enter key - event fired off to landing-page.html
        this.selectedSS1Item.emit(x);
    }

    
    /**
     * User pressed enter key
     * 
     * @param event 
     */
    pressedEnterKey(event) {
        if (event.keyCode  === 18 || event.keyCode  === 9 || event.keyCode  === 13 ) {
            this.displaySearchIcon = false;

            let x = {
                name: event.srcElement.value
            };

            // gunit - grab it from the first item of last ss1 query
            this._searchHistory.addItem("searchQuery_name", {
                name: event.srcElement.value,
                id: null,
                searchEntry: 'enter',
                ss1Gunit: this.elasticsearch.ss1_gunit,
                ss1New: true
            });

            // s2s - user hits enter key - event fired off to landing-page.html
            this.selectedSS1Item.emit(x);
        }
    }


    clickSearch() {
        // console.log('-=-X=-=X-=-=X-=- pressedEnterKey -=-=X-=-=X-=-=X-=-=X-=- ' +  this.router.url );
        if (this.termForm.value.value) {
            if (this.termForm.value.value.length > 2) {
                // this.displayResults = false;

                let x = {
                    name: this.termForm.value.value
                };

                // grab "unit" it from the first item of last ss1 query
                this._searchHistory.addItem("searchQuery_name", {
                    name: this.termForm.value.value,
                    id: null,
                    searchEntry: 'enter',
                    ss1Gunit: this.elasticsearch.ss1_gunit,
                    ss1New: true
                });

                this.selectedSS1Item.emit(x);
            }
        }
        else if (this.router.url === '/sp') {
            let x = {
                name: ''
            };
            this.selectedSS1Item.emit(x);
        }
    }


    /**
     * User call barcode scanner
     */
    barcodeCapture() {
        if(Meteor.isCordova) {

            let captureThis0 = this;
            
            Meteor.startup(function () {

                cordova.plugins.barcodeScanner.scan(
                    function (result) {

                        captureThis0.upc = result.text

                        console.log('UPC = ' + this.upc);

                        Meteor.call('checkIfUPCExistAlready', captureThis0.upc, function (err, res) { 
                            
                            if(err) {
                                alert('ERROR: ' + res.name + ' -- ' + res.id + ' -- ' + res.status + ' -- ' + res.error );
                            }
                            else if(res.status) {
                                alert("ITEM ALREADY EXIST IN MONGO DB");  
                            }
                            else {
                                alert('Next, please position camera to take a picture of item.');
                                captureThis0.takeDaPicture();
                            }
                        });

                    }, 
                    function (error) {
                        alert("Scanning failed: " + error);
                    }
                );
            });
        }
    }


    barcodeCapture_TEST() {
        // this.upc = "073852096521";      // URELL 9652 Advanced Instant Hand Sanitizer
        // this.upc = "X000TGBMC1";        // invalid bar code
        // this.upc = "3732300202";        // Musselman's Apple Butter
        // this.upc = "00037323002022";    // Musselman's Apple Butter
        this.upc = "72273384897";       // S&W Chili Beans
        
        let captureThis0 = this;
        Meteor.call('checkIfUPCExistAlready', this.upc, function (err, res) { 

            if(err) {
                alert('ERROR: ' + res.name + ' -- ' + res.id + ' -- ' + res.status + ' -- ' + res.error );
            }
            else if(res.status) {
                alert("ITEM ALREADY EXIST IN MONGO DB");  
            }
            else {
                captureThis0.takeDaPicture();
            }
        });
      }


    /**
     * Code is redundant - copied from new-item.ts
     * Take picture using custom package meteor add cgmdg:camera
     */
    takeDaPicture() {
        this.picFileName = Random.id(17) + '_upc.png';                             

        CGMeteorCamera.getPicture( (error, res) => {
            if (error) {
                console.log('!!!!!!!!!!!!! Failed to fs log ${error}');
                console.log(error);
            }
            else {
                console.log('==== GOT PHOTO ====');
                let uploader = new Slingshot.Upload("myFileUploads");

                // place global this into a local variable that is accessible within scope of this function
                let captureThis1 = this;

                var imageFile =  CGMeteorCamera.dataURItoFile(res, this.picFileName);                

                uploader.send(imageFile, Meteor.bindEnvironment(function(error, downloadUrl) {
                    if (error) {
                        // Log service detailed response.
                        console.error('Error uploading', uploader.xhr.response);
                        alert (error);
                    }
                    else {
                        console.log(" upload url == " + downloadUrl);
                        // captureThis1.updateImageParamsDelayed( this.picFileName );
                        captureThis1.updateImageParamsDelayed();
                    }
                }));
            }
        });
    }

    updateImageParamsDelayed() {
        let aws_image_path_thumb =  Meteor.settings.public.AWS_IMAGE_PATH + Meteor.settings.public.AWS_IMAGE_THUMB;
        let filename = this.picFileName;
        let code = this.upc

        var myInterval = Meteor.setInterval(function () {
            console.log("debug -----  1.2 second delayed -- filename -- " +  aws_image_path_thumb + ' -- ' + filename);
            Meteor.call('checkValidImage', aws_image_path_thumb + filename, (error, res) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(res);
                    if (res) {
                        Meteor.clearInterval(myInterval);

                        console.log("debug -----  1.3 second delayed -- " + code + ' -- ' + filename + ' -- ' + this.upc + ' -- ' + this.picFileName);
            
                        Meteor.call('barcodeSearch', code, filename, function (err2, res2) { 
                            if(err2) {
                                alert('ERROR: ' + res2.name + ' -- ' + res2.id + ' -- ' + res2.status + ' -- ' + res2.error );
                            }
                            if(res2.status) {
                                alert('SUCESS: ' + res2.name + ' #### ' + res2.id + ' #### ' + res2.status + ' -- ' + res2.error );
                            }
                            else {
                                alert('SUCESS: PIC SAVED');
                            }
                        });


                    }
                }
            });
        }, 1200);
    }



}
