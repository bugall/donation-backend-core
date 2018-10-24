const conn = require('./conn');
const pay = require('./models/pay');

module.exports = {
    Pay: pay(conn)
};
