const { Pay } = require('../../database');
const Queue = require('../queue');
const config = require('../../config');
const Q = new Queue(config.queue, 'createWallet');

exports.payCallback = async (ctx) => {
    const data = await Pay.create({
        order_id: 1,
        total: 100,
        channel: 'wechat',
        status: 0
    }, {
        raw: true
    });

    await Q.send([data]);
    ctx.body = {
        code: 0,
        data: data,
        message: 'success'
    };
};
