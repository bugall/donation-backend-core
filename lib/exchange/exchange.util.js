const { BlockShareRound, BlockShareSubmit } = require('../../database');

module.exports = class ConfirmUtil {
    constructor (config) {
        this.minPayment = 0;
        this.config = config;
        this.coin = this.config.coin.name;
        this.processingConfig = this.config.paymentProcessing;
        // eslint-disable-next-line
    }
};
