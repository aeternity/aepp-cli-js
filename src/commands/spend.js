import { Command } from 'commander';
import { encode, Encoding } from '@aeternity/aepp-sdk';
import { initSdkByWalletFile } from '../utils/cli.js';
import { print, printTransaction } from '../utils/print.js';
import {
  nodeOption,
  jsonOption,
  coinAmountParser,
  feeOption,
  forceOption,
  passwordOption,
  ttlOption,
} from '../arguments.js';

export default new Command('aecli spend')
  .description('Sends coins to another account or contract.')
  .addHelpText('after', `

Example call:
  $ aecli spend ./wallet.json ak_2GN72... 100 --password top-secret
  $ aecli spend ./wallet.json aens-name.chain 1.23ae --password top-secret
  $ aecli spend ./wallet.json ak_2GN72... 20% --password top-secret --ttl 20`)
  .argument('<wallet_path>', 'A path to wallet file')
  .argument('<receiver>', 'Address or name of recipient account')
  .argument(
    '<amountOrPercent>',
    'Amount of coins to send in aettos/ae (example: 1.2ae), or percent of sender balance (example: 42%)',
    (amount) => {
      if (amount.endsWith('%')) return { fraction: +amount.slice(0, -1) };
      return { amount: coinAmountParser(amount) };
    },
  )
  .option('--payload [payload]', 'Transaction payload as text', '')
  .addOption(feeOption)
  .addOption(ttlOption(true))
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .addOption(nodeOption)
  .addOption(passwordOption)
  .addOption(forceOption)
  .addOption(jsonOption)
  .action(async (
    walletPath,
    receiverNameOrAddress,
    { amount, fraction },
    {
      ttl, json, nonce, fee, payload, ...options
    },
  ) => {
    const sdk = await initSdkByWalletFile(walletPath, options);
    const tx = await sdk[amount != null ? 'spend' : 'transferFunds'](
      amount ?? fraction / 100,
      receiverNameOrAddress,
      {
        ttl, nonce, payload: encode(Buffer.from(payload), Encoding.Bytearray), fee,
      },
    );
    if (!json) print('Transaction mined');
    await printTransaction(tx, json, sdk);
  });
