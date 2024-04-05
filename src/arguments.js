import { Argument, Option } from 'commander';
import BigNumber from 'bignumber.js';
import { MIN_GAS_PRICE } from '@aeternity/aepp-sdk';

export const coinAmountParser = (amount) => {
  if (amount.endsWith('ae')) return new BigNumber(amount.slice(0, -2)).shiftedBy(18);
  return new BigNumber(amount);
};

export const feeOption = new Option('-F, --fee [fee]', 'Override the transaction fee')
  .argParser(coinAmountParser);

export const nonceArgument = new Argument('<nonce>', 'Unique number that is required to sign transaction securely')
  .argParser((nonce) => +nonce);

export const nodeOption = new Option('-u, --url [nodeUrl]', 'Node to connect to')
  .default('https://mainnet.aeternity.io', 'mainnet')
  .env('AECLI_NODE_URL');

export const compilerOption = new Option('--compilerUrl [compilerUrl]', 'Compiler to connect to')
  .default('https://v7.compiler.aepps.com', 'stable compiler')
  .env('AECLI_COMPILER_URL');

export const jsonOption = new Option('--json', 'Print result in json format');

export const gasOption = new Option('-G, --gas [gas]', 'Amount of gas to call/deploy the contract')
  .argParser((gas) => +gas);

export const gasPriceOption = new Option('--gasPrice [gasPrice]', `Gas price to call/deploy the contract (default: based on network demand or ${MIN_GAS_PRICE})`);

export const forceOption = new Option('-f, --force', 'Ignore node version compatibility check');

export const passwordOption = new Option('-P, --password [password]', 'Wallet Password');

export const ttlOption = new Option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default: current height increased by 3 or infinity)');

export const networkIdOption = new Option('--networkId [networkId]', 'Network id');
