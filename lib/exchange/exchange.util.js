const { Pay } = require('../../database');
const {Apis} = require('idacjs-ws');

module.exports = class ExchangeUtil {
    constructor (config) {
        this.config = config;
    }

    async fetch_account(account_name) {
        return Apis.instance().db_api().exec('get_account_by_name', [account_name]);
    };

    async exchange(to) {
        await Promise.all([fetch_account(from), fetch_account(to), unlock_wallet(from, password)]).then(results => {
            let fromAcc = results[0];
            if (!fromAcc) {
                throw new Error('转款账号不存在');
            }
            let toAcc = results[1];
            if (!toAcc) {
                throw new Error('收款账号不存在');
            }

            let memo_from_public, memo_to_public;
            if (memo) {
                memo_from_public = fromAcc.options.memo_key;

                // The 1s are base58 for all zeros (null)
                if (/111111111111111111111/.test(memo_from_public)) {
                    memo_from_public = null;
                }

                memo_to_public = toAcc.options.memo_key;
                if (/111111111111111111111/.test(memo_to_public)) {
                    memo_to_public = null;
                }
                let fromPrivate = PrivateKey.fromWif(results[2].wifKey);
                if (memo_from_public != fromPrivate.toPublicKey().toPublicKeyString()) {
                    throw new Error('备注不存在');
                }
            }

            let memo_object;
            if (memo && memo_to_public && memo_from_public) {
                let nonce = TransactionHelper.unique_nonce_uint64();
                memo_object = {
                    from: memo_from_public,
                    to: memo_to_public,
                    nonce,
                    message: Aes.encrypt_with_checksum(
                        PrivateKey.fromWif(results[2].wifKey),
                        memo_to_public,
                        nonce,
                        new Buffer(memo, 'utf-8')
                    )
                };
            }

            let tr = new TransactionBuilder();
            tr.add_operation(tr.get_type_operation('transfer', {
                fee: {
                    amount: 0,
                    asset_id: fee_id
                },
                from: fromAcc.id,
                to: toAcc.id,
                amount: { amount: accMult(amount, Math.pow(10, asset.precision)), asset_id: asset.asset_id },
                memo: memo_object
            }));
            return process_transaction(tr, from, password, broadcast);
        })
    }
};
