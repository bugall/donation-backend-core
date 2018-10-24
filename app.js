'use strict';
const config = require('./config');

const dbConn = require('./database/conn');

// pre-start, check service state
dbConn.authenticate().then(() => {
    console.log('Reward Service Start');
    // start
    return reward.start();
}).catch((err) => {
    console.log(err, 'reward');
});
