const Queue = require('../queue');
const WalletUtil = require('./wallet.util');
const _ = require('lodash');
const colors = require('colors');

module.exports = class Wallet extends WalletUtil {
    constructor (config) {
        super(config);
        this.queue = {
            createWallet: new Queue(config.queue, 'createWallet'),
            exchange: new Queue(config.queue, 'exchangeCoin')
        };
    }

    async start () {
        await this.controller();
    }

    async controller () {
        const content = await this.queue.createWallet.getMessage();
        await this.logic(content);
    }

    isJSON (str) {
        if (typeof str === 'string') {
            try {
                const obj = JSON.parse(str);
                if (typeof obj === 'object' && obj) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
    }
    async logic (content) {
        if (!this.isJSON(content.Message.MessageBody)) {
            if (_.isEmpty(content.Message)) {
                await this.controller();
            }
            await this.queue.createWallet.deleteMessage(content.Message.ReceiptHandle);
            await this.controller();
        }

        const messageContent = JSON.parse(content.Message.MessageBody);

        try {
            const data = await this.createWallet(messageContent);
            if (!_.isEmpty(data)) {
                await this.queue.exchange.send([data]);
            }
        } catch (err) {
            console.log(colors.red(err));
        }
        try {
            await this.queue.createWallet.deleteMessage(content.Message.ReceiptHandle);
        } catch (err) {
            console.log(colors.red(err));
        }
        await this.controller();
    }
};