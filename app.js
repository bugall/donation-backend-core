'use strict';
const config = require('./config');
const api = require('./lib/api');
const CreateWallet = require('./lib/wallet');
const Exchange = require('./lib/exchange');

const dbConn = require('./database/conn');

const colors = require('colors');

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

router.get('/', api.payCallback);

app.use(router.routes());
app.use(router.allowedMethods());

// pre-start, check service state
dbConn.authenticate().then(() => {
    console.log(colors.cyan('Wallet Service Start'));
    // start
    app.listen(config.server.port);
    const createWallet = new CreateWallet(config);
    const exchange = new Exchange(config);
    createWallet.start();
    exchange.start();
}).catch((err) => {
    console.log(colors.red(err, 'reward'));
});
