const AliMNS = require('ali-mns');
const colors = require('colors');


module.exports = class Queue {
    constructor (config, queueName) {
        this.name = queueName;
        this.config = config;
        this.account = new AliMNS.Account(this.config.accountId, this.config.accessId, this.config.secretKey);
        this.regionSingapore = new AliMNS.Region(AliMNS.City.Singapore, AliMNS.NetworkType.Public);
        this.mq = new AliMNS.MQ(this.config.queues[queueName], this.account, this.regionSingapore)
    }

    send (content) {
        for (const i in content) {
            this.mq.sendP(JSON.stringify(content[i]));
        }
    }

    async getMessage () {
        let data = { Message: {} };
        try {
            data = await this.mq.recvP();
            console.log(colors.blue(this.name), colors.green('Get Message: ', data.Message.MessageBody));
        } catch (err) {
            console.log(colors.blue(this.name), colors.gray('Empty Content'));
        }
        return data;
    }

    async deleteMessage (handle) {
        await this.mq.deleteP(handle);
        console.log(colors.blue(this.name), colors.blue('Message Removed: ', handle));
    }
};
