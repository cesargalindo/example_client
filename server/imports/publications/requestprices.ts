import { Meteor } from 'meteor/meteor';
import { RequestPrices } from '../../../both/collections/requestprices.collection';

Meteor.publish('myrequestprice', function(id: string) {

    //http://guide.meteor.com/data-loading.html
    if (!this.userId) {
        return this.ready();
    }

    let ff = RequestPrices.find({
            _id: id,
            owner: this.userId
        },
        {
            reactive: false
        });


    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ SERVER myrequestprice " + id + " ###################### ==> " + ff.cursor.count());
    return ff;
});

