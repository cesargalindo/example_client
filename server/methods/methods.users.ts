import { Meteor } from 'meteor/meteor';
import { Users } from '../../both/collections/users.collection';
import { Ledgers } from '../../both/collections/ledgers.collections';
import { Ledger } from '../../both/models/ledger.model';
import { SliderSettings } from '../../both/models/helper.models';

let Future = Npm.require( 'fibers/future' );

// Apolo Config
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import gql from 'graphql-tag';

let fetch = require('node-fetch');
global.fetch = fetch;

// Create Apollo Client
const networkInterface = createNetworkInterface({
    uri: Meteor.settings.public.GRAPHQL_URL,
    headers: {
        'Content-type': "application/json"
    }
});

let client = new ApolloClient({
    networkInterface
});

// Construct Apollo GrapQL Queries
const initialUserData = gql`
    query UserInfoQuery($id: String) {
        apUserbyId(id: $id) {
            _id
            userProfile {
                firstname
                lastname
            }
            cellVerified
            ranking {
                score
                downVotes
                upVotes
                thumbsUp
                thumbsDown
            }
            settings {
                payRequestDefault
                payRequestMax
                minHoursDefault
                minHoursMax
                quantityDefault
                quantityMax
            }
            withdrawalStatus
            submitStatus
            requestStatus
        }
    }
`;



Meteor.methods({

    /**
     * Retreive initial user data used by client
     *
     */
    'loadInitialUserData'() {
        if ( this.userId ) {

            // Create our future instance.
            let UserFuture = new Future();

            client.query({
                    query: initialUserData,
                    forceFetch: true,
                    variables: {
                        id: this.userId
                    }
                })
                .then((results) => {
                    if (results.data.apUserbyId) {

                        UserFuture.return({
                            status: true,
                            data: results.data.apUserbyId
                        });
                    }
                    else {
                        UserFuture.return({
                            status: false,
                            error: 'Invalid user 45.'
                        });
                    }

                }).catch((error) => {
                    console.log('Encountered invalid user 55.', error);
                    UserFuture.return({
                        status: false,
                        error: 'Invalid user 55.'
                    });
                });


            return UserFuture.wait();
        }
    },


    /**
     * Send email verification link
     *
     */
    'sendVerificationLink'() {
        if ( this.userId ) {
            let userId = this.userId;
            if ( userId ) {
                return Accounts.sendVerificationEmail( userId );
            }
        }

    },


    /**
     * Update user profile Name info
     *
     * @param firstname 
     * @param lastname 
     */
    'updateUserProfile'(firstname, lastname) {
        if ( this.userId ) {
            check(firstname, String);
            check(lastname, String);

            firstname = firstname.trim();
            lastname = lastname.trim();

            if (!/^[a-zA-Z\s]+$/.test(firstname)) {
                return {
                    status: false,
                    error: 'ERROR: invalid First name entered'
                }
            }

            if (!/^[a-zA-Z\s]+$/.test(lastname)) {
                return {
                    status: false,
                    error: 'ERROR: invalid Last name entered.'
                }
            }

            // Copy over password service in addition to email and cellphone
            Meteor.users.update(  this.userId, {
                $set: {
                    userProfile: {
                        firstname: firstname,
                        lastname:  lastname,
                    },
                }
            });

            return { status: true };
        }

        return { status: false };
    },


    /**
     * Update user profile settings info
     * 
     * @param ss 
     */
    'updateUserProfileSettings'(ss: SliderSettings) {

        if ( this.userId ) {
            check(ss, {
                payRequestDefault:Number,
                payRequestMax: Number,
                minHoursDefault: Number,
                minHoursMax: Number,
                quantityDefault: Number,
                quantityMax: Number
            });

            // Update user settings
            Meteor.users.update(  this.userId, {
                $set: {
                    settings: ss,
                }
            });

            return { status: true };
        }

        return { status: false };
    },


    /**
     * Update contractor user settings info
     *
     * @param pictureQuality 
     * @param forceImageTranser 
     */
    'updateContractorUserSettings'(pictureQuality: number, forceImageTranser: boolean) {

        if ( this.userId ) {
            check(pictureQuality, Number);
            check(forceImageTranser, Boolean);
            
            // Update user settings
            Meteor.users.update(  this.userId, {
                $set: {
                    contractor: {
                        pictureQuality: pictureQuality,
                        forceImageTranser: forceImageTranser
                    }
                }
            });

            return { status: true };
        }

        return { status: false };
    },


    /**
     * Update cellVerified
     *
     * @param status 
     */
    'user.update.cellVerified'(status) {
        if ( this.userId ) {
            check(status, Boolean);

            Meteor.users.update( this.userId, {
                $set: {
                    cellVerified: status
                }
            });
        }
    },

    /**
     * 
     * @param priceId 
     */
    'user.thumbsUpClicked'(priceId) {
        if ( this.userId ) {
            check(priceId, String);

            return {
                status: true
            }
        }
    },



    /**
     * Initialize new user ledger
     * Grant user 25 requests which is added to ledger.requests
     */
    'initializeUserLedger'() {
        if ( this.userId ) {
            let ledgerInfo = Ledgers.find({owner: this.userId})
                .fetch();

            console.log('----- ledgerInfo ======' + ledgerInfo.length);

            // insert insert if it doesn't exist for this user...
            if (!ledgerInfo.length) {

                let ledger = <Ledger>{};
                // TODO - determine Cordova stategy...
                // ledger.withdrawalStatus = 1;
                // ledger.submitStatus = 1;
                // ledger.requestStatus = 1;

                ledger.requests = Meteor.settings.REQUESTS.registration;
                ledger.balance = 0;
                ledger.pendingRequests = 0;
                ledger.pendingSubmits = 0;
                ledger.owner = this.userId;
                ledger.updated = new Date().getTime();
                ledger.created = ledger.updated;
                ledger.note = 'new user';
                Ledgers.insert(ledger).subscribe();
            }

        }

    },


    /**
     *  Change user password
     *
     * @param password 
     */
    'setUserPassword'(password) {
        if ( this.userId) {
            check(password, String);

            let options = {logout: false};
            Accounts.setPassword(this.userId, password,  options);
            return true;
        }

        return false;
    },


    /**
     *  Apply default user settings for Facebook user on login and registration
     *
     */
    'updateFacebookLogin'() {
        let userId = this.userId;

        let userInfo = Users.find({ _id: userId})
            .fetch();

        // TODO - grab cell phone number and store if available in userProfile??

        // apply default settings (email, cellphone) or copy existing user settings if user was overridden with FB account
        if (userInfo[0].emails == undefined) {

            // if Facebook user just over-rode existing email account, copy over existing password
            if (userInfo[0].services.password == undefined) {

                // check if FB user "copy"  exist;
                let userInfoFB = Users.find({ _id: 'FB__' + userInfo[0]._id})
                    .fetch();

                console.log(userInfoFB);

                // Copy password of existing Meteor account to new Facebook account if it exist
                if (userInfoFB.length) {
                    // Copy over password service in addition to email and cellphone
                    Meteor.users.update( userId, {
                        $set: {
                            services: {
                                facebook: userInfo[0].services.facebook,
                                resume:  userInfo[0].services.resume,
                                password:  userInfoFB[0].services.password
                            },
                            username: userInfoFB[0].services.password,

                            emails: [{
                                address: userInfo[0].services.facebook.email,
                                verified: userInfoFB[0].emails[0].verified
                            }],
                            // Ledger statuses are added in main.ts Accounts.onCreateUser
                            // withdrawalStatus: userInfoFB[0].withdrawalStatus,
                            // submitStatus: userInfoFB[0].submitStatus,
                            // requestStatus: userInfoFB[0].requestStatus,
                        }
                    });

                }
                else {
                    // 3 - previous account doesn't exist - just update email
                    // TODO - get cellphone from Cordova - comming soon  - if logging in through web ignore cell-phone??
                    Meteor.users.update( userId, {
                        $set: {
                            emails: [{
                                address: userInfo[0].services.facebook.email,
                                verified: false
                            }]
                            // Ledger statuses are added in main.ts  Accounts.onCreateUser
                            // withdrawalStatus: 0,
                            // submitStatus: 1,
                            // requestStatus: 1,
                        }
                    });

                }

            }

        }


        return true;
    },


    /**
     *  Confirm cell phone number if available - not already used
     * 
     * @param cellPhoneNumber 
     */
    'confirmCellphoneNumber'(cellPhoneNumber: string) {
        check(cellPhoneNumber, String);

        // Strip all characters from the input except digits
        cellPhoneNumber = cellPhoneNumber.replace(/\D/g, '');

        // 2 - Get user ranking/score - fetch-synchronous call
        let userInfo = Users.find({ username: cellPhoneNumber})
            .fetch();


        if (userInfo.length) {
            return false;
        }
        else {
            return true;
        }
    },


    /**
     *  Check if User is admin from Admin site
     * 
     * @param userID 
     */
    'checkAdminSiteUser'(userID: string) {
        check(userID, String);

        if (userID == Meteor.settings.ADMIN_KEY) {
            console.log("*** USER IS A SITE ADMIN USER ****");
            return true;
        }
        else {
            return false;
        }
    },


    /**
     *  Check Roles on server - alanning:roles is not reliable when calling from client
     * 
     * @param userID 
     */
    'checkRoles'(userID: string) {
        console.log('checkRoles - ID = ' + userID);
        return {
            admin: Roles.userIsInRole(userID, 'superadmin'),
            contractor: Roles.userIsInRole(userID, 'contractor'),
        };
    },


});

