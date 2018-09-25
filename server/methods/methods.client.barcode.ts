import { Meteor } from 'meteor/meteor';
import { upcitemdb_upcSearch } from '../functions/functions.client.barcodeAPI';

import { Items } from '../../both/collections/items.collection';
import { Item } from '../../both/models/item.model';
import { itemsInsert} from '../functions/functions.client.items';
import { Random } from 'meteor/random';

let Future = Npm.require( 'fibers/future' );


Meteor.methods({
    
    /**
     * Check if barcode exist in system
     * 
     * @param barcode 
     */
    'checkIfUPCExistAlready' (barcode) {
        check(barcode, String);
        if ( this.userId ) {
            // confirm bacode doesn't already exist in system
            let it = Items.find({
                upc: barcode
            }).fetch();

            // Item exist in ZoJab's db 
            if (it.length) {
                return {
                    id: it[0]._id,
                    name: it[0].name,
                    status: true
                };
            }
            else {
                return {
                    id: null,
                    name: null,
                    status: false,
                }
            }
        }
    },


    /**
      * Barcode search that calls upcitemdb API
      * 
      * @param barcode 
      * @param image 
      */
    'barcodeSearch' (barcode, image) {
        check(barcode, String);
        check(image, String);
        if ( this.userId ) {
            // confirm bacode doesn't already exist in system
            let it = Items.find({
                upc: barcode
            }).fetch();

            // Item exist in ZoJab's db 
            if (it.length) {
                return {
                    id: it[0]._id,
                    name: it[0].name,
                    status: true
                };
            }
            else {

                let owner = this.userId;
                let futureBC = new Future;

                upcitemdb_upcSearch(barcode, Meteor.bindEnvironment(function(err, products) {
                    let prod = JSON.parse( products.toString() );

                    let ni = <Item>{};                
                    ni.quantity = 1;     // this item is shared by all prices with different quantities
                    ni.public = 0;       // make public by default - allow community to flag item as inappropriate
                    ni.status = 0;       // set to active by default - only used for user submitted items
                    ni.created = new Date().getTime();
                    ni.owner = owner;

                    if (err) {
                        // UPC not found - Add picture with UPC - other information is bogus                    
                        console.error(err);
                        // X000TGBMC1 ==> { statusCode: 400,  W20170926-16:05:52.595(-7)? (STDERR)   data: '{"message":"The given upc is invalid","code":8002}' }
                        ni.name = err.data;
                        ni.upc = barcode;
                        ni.image = Meteor.settings.public.AWS_IMAGE_PATH + Meteor.settings.public.AWS_IMAGE_DEFAULT + image;
                    }
                    else {

                    let prod = JSON.parse( products.toString() );
                    console.log(prod.code + ' -- ' + prod.total );

                    if (prod.total) {
                            // UPC item found - store data
                            console.error ( JSON.stringify(prod.items[0].size)  );

                            // Add new item to mongoDB for later procsssing
                            ni.name = prod.items[0].title;
                            ni.upc = prod.items[0].upc;
                            ni.category = prod.items[0].category
                            ni.brand = prod.items[0].brand;
                            ni.model = prod.items[0].model;
                            ni.image2 = _.first(prod.items[0].images);
                            ni.size2 = prod.items[0].size;
                            
                            ni.image = Meteor.settings.public.AWS_IMAGE_PATH + Meteor.settings.public.AWS_IMAGE_DEFAULT + image;
                        }
                        else {
                            // UPC not found - Add picture with UPC - other information is bogus
                            ni.name = 'please fix name_' + Random.id(18) + '_bogus name';
                            ni.upc = barcode;
                            ni.image = Meteor.settings.public.AWS_IMAGE_PATH + Meteor.settings.public.AWS_IMAGE_DEFAULT + image;
                        }
                    }

                    // Insert new Item
                    Items.insert(ni)
                    .subscribe(
                        x => {
                            console.error('------4----- barcodeSearch item insert -------4------ itemID = ' + x);
                            futureBC.return({
                                status: true,
                                name: ni.name,
                                id: x
                            } );
                        },
                        err => {
                            console.log(err);
                            futureBC.return({
                                id: null,
                                name: null,
                                status: false,
                                error: 'Unable to insert item'
                            });
                        }
                    );   
                }));

                return futureBC.wait();
            }
        }            
    },


});


    