const { Pay } = require('../../database');
const { ChainStore, PrivateKey, TransactionBuilder, key } = require('idacjs');
const {Apis, ChainConfig} = require("bitsharesjs-ws");
ChainConfig.networks.IDAC = {
    core_asset: "IDAC",
    address_prefix: "IDAC",
    chain_id: "0ec0570676ca3fb00c159df0f42d293f29de279861f55c971b01b471a662ec91"
}
ChainConfig.setPrefix('IDAC');

module.exports = class ExchangeUtil {
    constructor (config) {
        this.config = config;
    }

    async exchange(user) {
        const data = {
            donor_phone: '18530154993',
            donor_name: '',
            donor_id: '',
            funds: 12005,
            owner: user.account_id,
            create_date_time: user.created_at || new Date(),
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            }
        }

        await Apis.instance(this.config.wallet.witness, true).init_promise;
        await ChainStore.init();
        const tr = new TransactionBuilder()
        tr.add_type_operation('donation_create', data);

        await Promise.all([
            tr.set_required_fees(),
            tr.update_head_block()
        ]);

        const pKey = key.get_brainPrivateKey(user.active_key);
        tr.add_signer(pKey);
        await tr.broadcast();
    }
};
