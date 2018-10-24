const Queue = require('../queue');
const WalletUtil = require('./wallet.util');
const _ = require('lodash');

module.exports = class Wallet extends WalletUtil {
    constructor (config) {
        super(config);
        this.queue = {
            createWallet: new Queue(config.queue, 'createWallet')
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
            await this.queue.deleteMessage(content.Message.ReceiptHandle);
            await this.controller();
        }

        const messageContent = JSON.parse(content.Message.MessageBody);

        try {
            await this.createWallet(messageContent);
        } catch (err) {
            console.log(err);
        }
        try {
            await this.queue.deleteMessage(content.Message.ReceiptHandle);
        } catch (err) {

        }
        await this.controller();
    }
};