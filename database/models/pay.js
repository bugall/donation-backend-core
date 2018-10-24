const Sequelize = require('sequelize');

module.exports = (conn) => conn.define('tb_pay', ({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    active_key: {
        type: Sequelize.STRING,
        allowNull: true
    },
    owner_key: {
        type: Sequelize.STRING,
        allowNull: true
    },
    total: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    account_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    account: {
        type: Sequelize.STRING,
        allowNull: true
    },
    channel: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // 0 待创建钱包, 5 待转账, 10 转账完成
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        menu: [0, 5, 10, 15],
        default: 0
    },
    create_wallet_time: {
        type: Sequelize.DATE,
        allowNull: true
    },
    exchange_export_time: {
        type: Sequelize.DATE,
        allowNull: true
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE
}), {
    tableName: 'tb_pay'
});
