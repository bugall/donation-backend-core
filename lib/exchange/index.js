const Queue = require('../queue');
const ExchangeUtil = require('./exchange.util');
const ChainWebSocket = require('idacjs-ws/cjs/src/ChainWebSocket');
const colors = require('colors');
const _ = require('lodash');

module.exports = class Exchange extends ExchangeUtil {
    constructor (config) {
        super(config);
        this.config = config;
        this.ws_rpc = new ChainWebSocket(config.wallet.host, (result, err) => {
            if (_.isEmpty(err)) {
                console.log(colors.blue('Exchange'), colors.cyan('Wallet RPC Service Start!!!!'));
            } else {
                console.log(colors.blue('Exchange'), colors.red(err));
            }
        });
        this.queue = {
            exchange: new Queue(config.queue, 'exchangeCoin')
        };
    }

    async start () {
        await this.controller();
    }

    async controller () {
        const content = await this.queue.exchange.getMessage();
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
            } catch (err) {
                console.log(colors.red(err));
                return false;
            }
        }
    }
    async logic (content) {
        if (!this.isJSON(content.Message.MessageBody)) {
            if (_.isEmpty(content.Message)) {
                await this.controller();
            }
            await this.queue.exchange.deleteMessage(content.Message.ReceiptHandle);
            await this.controller();
        }

        const messageContent = JSON.parse(content.Message.MessageBody);

        try {
            await this.exchange(messageContent);
        } catch (err) {
            console.log(colors.red(err));
        }
        // 标记消息处理完毕
        try {
            await this.queue.exchange.deleteMessage(content.Message.ReceiptHandle);
        } catch (err) {
            console.log(colors.red(err));
        }
        await this.controller();
    }
};
