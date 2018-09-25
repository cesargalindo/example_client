import { Meteor } from 'meteor/meteor';
import { ApolloClient, createNetworkInterface } from 'apollo-client';

const networkInterface = createNetworkInterface({
    uri: Meteor.settings.public.GRAPHQL_URL
});

// I ADDED THIS FOR AUTHENTICATION - I DON'T KNOW HOW TO USE IT YET??
networkInterface.use([{
    applyMiddleware(req, next) {
        if (!req.options.headers) {
            // Create the header object if needed.
            req.options.headers = {};  
        }
        // get the authentication token from local storage if it exists
        req.options.headers.authorization = localStorage.getItem('token') || null;
        next();
    }
}]);


export const client = new ApolloClient({
    networkInterface,
    dataIdFromObject: r => r['id'],
});
