const { BlockShareRound, BlockShareSubmit } = require('../../database');

module.exports = class Reward {
    constructor (config) {
        this.minPayment = 0;
        this.config = config;
        this.coin = this.config.coin.name;
        this.processingConfig = this.config.paymentProcessing;
    }
    
};
