import { Component, OnInit, NgZone } from "@angular/core";
import { Angular2Apollo, ApolloQueryObservable } from 'angular2-apollo';
import { Observable } from 'rxjs/Observable';

import gql from 'graphql-tag';

import { VariablesService } from '../services-global/VariablesService';


import template from "./favorites.html";
import style from './favorites.scss';

@Component({
    selector: "favorites",
    template,
    styles: [ style ],
})
export class FavoritesComponent implements OnInit {
    apolloFavs1: ApolloQueryObservable<any>;

    samplePriceId: string = '3rhex2rgLTuM4Keji';

    items: Array = [];
    stores: Array = [];

    constructor(
        private _ngZone: NgZone,        
        private apollo: Angular2Apollo,
        public _varsService: VariablesService) { }

    ngOnInit() { 

        let owner = Meteor.userId();

        // Load Requestprices payRequest Sum - load async
        this.apolloFavs1 = this.apollo.watchQuery({
            query: gql`
            query FavoritesAp1($owner: String) {
                apFavorites(owner: $owner) {
                    _id
                    owner
                    favItems {
                        id
                        created
                        itemT {
                            name
                            size
                            unit
                            quantity
                            image
                        }
                    }
                    favStores {
                        id
                        created
                        storeT {
                            name
                            address
                        }
                    }
              }
            }
          `,
            variables: {
                owner: owner,
            },
            forceFetch: true
        })
            .map( x => {
                this._ngZone.run(() => { // run inside Angular2 world
                    if (x.data) {
                        console.warn('######## THE FavoritesAp1 ####### ');
                        if (x.data.apFavorites) {
                            this.items = x.data.apFavorites.favItems;
                            this.stores = x.data.apFavorites.favStores;
                        }
    
                        return x.data.apFavorites;
                    }
                });                    
            });



    }

    ngAfterViewInit() {
        this._varsService.setReactiveHideToolbar(false);
        this._varsService.setReactiveTitleName('Favorites');
    }

    check123(x) {
        alert('thumbs up... ' + x);
    }

    check555(x) {
        alert('thumbs up... ' + x);
    }


    addFavoriteItem(itemId) {

        Meteor.call('add.favorite.item', itemId, (err, res) => {
                if (err) {
                    console.error("!!!!!!!! GOT ERROR ON: add.favorite.item..... !!!!!!!!!");
                    console.error(err);
                    return;
                }
                else {
                    if (!res.status) {
                        console.error("!!!!!!!! ERROR ON: add.favorite.item ..... !!!!!!!!! == " + res.error);
                        console.error(err);
                        return;
                    }
                    else {
                        console.warn("SUCCESSFULLY INSERTED add.favorite.item... " + res.status);
                        console.warn(res);
                        this.apolloFavs1.refetch();
                    }
                }
        });
    }

    removeFavoriteItem(itemId) {
        
        Meteor.call('remove.favorite.item', itemId, (err, res) => {
                if (err) {
                    console.error("!!!!!!!! GOT ERROR ON: remove.favorite.item..... !!!!!!!!!");
                    console.error(err);
                    return;
                }
                else {
                    if (!res.status) {
                        console.error("!!!!!!!! ERROR ON: remove.favorite.item ..... !!!!!!!!! == " + res.error);
                        console.error(err);
                        return;
                    }
                    else {
                        console.warn("SUCCESSFULLY INSERTED remove.favorite.item... " + res.status);
                        console.warn(res);
                        this.apolloFavs1.refetch();
                    }
                }
        });
    }

    addFavoriteStore(storeId) {
        Meteor.call('add.favorite.store', storeId, (err, res) => {
                if (err) {
                    console.error("!!!!!!!! GOT ERROR ON: add.favorite.store..... !!!!!!!!!");
                    console.error(err);
                    return;
                }
                else {
                    if (!res.status) {
                        console.error("!!!!!!!! ERROR ON: add.favorite.store ..... !!!!!!!!! == " + res.error);
                        console.error(err);
                        return;
                    }
                    else {
                        console.warn("SUCCESSFULLY INSERTED add.favorite.store... " + res.status);
                        console.warn(res);
                        this.apolloFavs1.refetch();                        
                    }
                }
        });
    }

    removeFavoriteStore(storeId) {
        Meteor.call('remove.favorite.store', storeId, (err, res) => {
                if (err) {
                    console.error("!!!!!!!! GOT ERROR ON: remove.favorite.store..... !!!!!!!!!");
                    console.error(err);
                    return;
                }
                else {
                    if (!res.status) {
                        console.error("!!!!!!!! ERROR ON: remove.favorite.store ..... !!!!!!!!! == " + res.error);
                        console.error(err);
                        return;
                    }
                    else {
                        console.warn("SUCCESSFULLY INSERTED remove.favorite.store... " + res.status);
                        console.warn(res);
                        this.apolloFavs1.refetch();                        
                    }
                }
        });
    }



}
