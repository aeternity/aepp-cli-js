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
import { addExamples, exampleAddress1, exampleName } from '../utils/helpers.js';

const command = new Command('spend')
  .summary('send coins to another account or contract')
  .description('Sends coins to another account or contract.')
  .argument('<wallet>', 'A path to wallet file')
  .argument('<receiver>', 'Address or name of recipient account')
  .argument(
    '<amount>',
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

addExamples(command, [
  `./wallet.json ${exampleAddress1} 100`,
  `./wallet.json ${exampleName} 1.23ae`,
  `./wallet.json ${exampleAddress1} 20% --ttl 20`,
]);

export default command;
