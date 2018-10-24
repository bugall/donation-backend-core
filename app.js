'use strict';
const config = require('./config');
const api = require('./lib/api');
const CreateWallet = require('./lib/wallet');

const dbConn = require('./database/conn');
const createWallet = new CreateWallet(config);

// pre-start, check service state
dbConn.authenticate().then(() => {
    console.log('Wallet Service Start');
    // start
    return createWallet.start();
}).catch((err) => {
    console.log(err, 'reward');
});

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.get('/', api.payCallback);

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.server.port);