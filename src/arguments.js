import { Argument, Option } from 'commander';
import BigNumber from 'bignumber.js';
import { NODE_URL, COMPILER_URL } from './utils/constant';

export const coinAmountParser = (amount) => (
  new BigNumber(amount.replace(/ae$/, '')).shiftedBy(amount.endsWith('ae') ? 18 : 0)
);

export const feeOption = new Option('-F, --fee [fee]', 'Override the transaction fee')
  .argParser(coinAmountParser);

export const nonceArgument = new Argument('<nonce>', 'Unique number that is required to sign transaction securely')
  .argParser((nonce) => +nonce);

export const nodeOption = new Option('-u, --url [nodeUrl]', 'Node to connect to')
  .default(NODE_URL, 'Aeternity testnet')
  .env('AECLI_NODE_URL');

export const compilerOption = new Option('--compilerUrl [compilerUrl]', 'Compiler to connect to')
  .default(COMPILER_URL, 'Stable compiler')
  .env('AECLI_COMPILER_URL');

export const jsonOption = new Option('--json', 'Print result in json format');

export const gasOption = new Option('-G --gas [gas]', 'Amount of gas to call/deploy the contract')
  .argParser((gas) => +gas);

export const forceOption = new Option('-f --force', 'Ignore node version compatibility check');
