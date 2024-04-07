import { Argument, Option } from 'commander';
import BigNumber from 'bignumber.js';
import { MIN_GAS_PRICE } from '@aeternity/aepp-sdk';
import { NODE_URL, COMPILER_URL } from './utils/constant.js';

export const coinAmountParser = (amount) => {
  if (amount.endsWith('ae')) return new BigNumber(amount.slice(0, -2)).shiftedBy(18);
  return new BigNumber(amount);
};

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

export const gasOption = new Option('-G, --gas [gas]', 'Amount of gas to call/deploy the contract')
  .argParser((gas) => +gas);

export const gasPriceOption = new Option('--gasPrice [gasPrice]', 'Gas price to call/deploy the contract')
  .default(MIN_GAS_PRICE, 'Minimum gas price') // TODO: use gas price from the node after updating sdk to 13.3.0
  .argParser(coinAmountParser);

export const forceOption = new Option('-f, --force', 'Ignore node version compatibility check');

export const passwordOption = new Option('-P, --password [password]', 'Wallet Password');

export const ttlOption = new Option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks')
  .default(0, 'forever');

export const networkIdOption = new Option('--networkId [networkId]', 'Network id');
