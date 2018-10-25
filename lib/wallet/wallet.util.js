const { Pay } = require('../../database');
const sha256 = require('crypto-js/sha256');
const { Apis, ChainConfig } = require('bitsharesjs-ws');
const ChainWebSocket = require('bitsharesjs-ws/cjs/src/ChainWebSocket');
const { key, PrivateKey } = require('idacjs');
const dictionary = require('./dictionary_en');

const _ = require('lodash');
const uuid = require('uuid');
const colors = require('colors');

ChainConfig.networks.IDAC = {
    core_asset: 'IDAC',
    address_prefix: 'IDAC',
    chain_id: '0ec0570676ca3fb00c159df0f42d293f29de279861f55c971b01b471a662ec91'
};
ChainConfig.setPrefix('IDAC');

module.exports = class WalletUtil {
    constructor (config) {
        this.config = config;
        this.ws_rpc = new ChainWebSocket(config.wallet.host, (result, err) => {
            if (_.isEmpty(err)) {
                console.log(colors.cyan('Wallet RPC Service Start!!!!'));
            } else {
                console.log(colors.red(err));
            }
        });
    }
    async generatorWallet (data) {
        const user = {};
        user.anonymous = false;
        user.credential = sha256(uuid.v4() + uuid.v4()).toString();
        user.anonymous = false;
        user.account = `idac${sha256(uuid.v1()).toString().substr(0, 28)}`;
        user.credential = sha256(user.account).toString();
        delete (user.password);
        user.owner_key = key.suggest_brain_key(dictionary.en).toUpperCase();
        user.active_key = key.suggest_brain_key(dictionary.en).toUpperCase();

        await this.ws_rpc.connect_promise;
        await this.ws_rpc.call([
            0,
            'register_account',
            [
                user.account,
                key.get_brainPrivateKey(user.owner_key).toPublicKey().toPublicKeyString(),
                key.get_brainPrivateKey(user.active_key).toPublicKey().toPublicKeyString(),
                this.config.wallet.registar,
                this.config.wallet.registar,
                50,
                true
            ]
        ]);
        console.log([
            user.account,
            key.get_brainPrivateKey(user.owner_key).toPublicKey().toPublicKeyString(),
            key.get_brainPrivateKey(user.active_key).toPublicKey().toPublicKeyString(),
            this.config.wallet.registar,
            this.config.wallet.registar,
            50,
            true
        ]);
        user.account_id = await this.ws_rpc.call([
            0,
            'get_account_id',
            [user.account]
        ]);
        const result = await Pay.update({
            account: user.account,
            account_id: user.account_id,
            owner_key: user.owner_key,
            active_key: user.active_key,
            status: 5,
            create_wallet_time: new Date()
        }, {
            where: {
                id: data.id
            }
        });
        return result;
    }
    async createWallet (data) {
        // 判断对的数据是否已经创建过钱包
        const walletInfo = await Pay.find({
            where: {
                id: data.id,
                status: {
                    $ne: 0
                }
            }
        });
        if (_.isEmpty(walletInfo)) {
            await this.generatorWallet(data);
        }
        const result = await Pay.find({
            where: { id: data.id },
            raw: true
        });
        return result;
    }
};
