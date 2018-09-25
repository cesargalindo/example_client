import { Component, OnInit} from '@angular/core';
import { VariablesService } from '../services-global/VariablesService';
import { SocketClientService } from '../services-global/SocketClientService';
import template from './top-payout.html';

@Component({
    selector: 'top-payout',
    template
})
export class TopPayoutComponent  implements Component, OnInit {

    constructor(public _varsService: VariablesService,
                public _socketService: SocketClientService) { }

    /* Observers and streams */
    private socketDataStream: any;
    private _socketQueryName: string = "top-payouts-user"  
    
    /* Top payouts data */
    public userTopPayouts: any = [];
    public filteredTopPayouts: any = [];

    /* Currently selected item */
    public selectedIndex: number = -1;

    /* Search, filter, and sort user payouts */
    public searchCriteria: object = {
        location: {},
        filters: {},
        order: "distance",
        searchText: "",
    }
    onLocationChange(newLocation) {
        this.searchCriteria['location'] = newLocation;
        console.log("---36 tp location update received from map---");
        this._socketService.send(this._socketQueryName, this.searchCriteria['location']);

    }
    formatPayoutData(rawData) {
        return rawData.map((item) => {
            var mapped = item;
            mapped.store.distanceFromUser = parseInt(item.store.distanceFromUser)
            mapped.payoutSum = (item.payoutSum/100).toFixed(2);
            mapped.latitude = mapped.store.location.coordinates[1];
            mapped.longitude= mapped.store.location.coordinates[0];
            return mapped;
        })
    }
    applySearchCriteria(payouts) {
        console.log("46 -- PAYOUT DATA RECEIVED");
        return payouts; //TODO: apply search criteria
    }


    /* Co-ordinate user click events between list and map */
    onMarkerClicked(index) {
        alert(JSON.stringify(this.filteredTopPayouts[index]));
        this.selectedIndex = index;
    }

    onListItemClicked(index) {
        //TODO: pan the map & display directions   
    }

    // conditional css highlighting of list items
    highlightIfSelected(index) {
        if (this.selectedIndex == index)
            return this._varsService.styles['selectedListItem'];
        else
            return {}
    }


    ngOnInit() {
        this.subscribeToSocketStream();
    }


    ngAfterViewInit() {
        this._varsService.setReactiveHideToolbar(false);
        this._varsService.setReactiveTitleName('Top Pays');
    }


    subscribeToSocketStream() {
            this.socketDataStream = this._socketService.getFilteredStream(this._socketQueryName)
            .subscribe((response) => {
                console.log("--- 56 tp Got Socket Response ---");
                //console.warn("---"872 tp: Received data back: "+JSON.stringify(response.payload));
                this.userTopPayouts = this.formatPayoutData(response.payload);
                this.filteredTopPayouts = this.applySearchCriteria(this.userTopPayouts);
            });
    }
}