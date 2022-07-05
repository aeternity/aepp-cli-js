import { Argument, Option } from 'commander';
import { GAS_MAX } from '@aeternity/aepp-sdk';
import { NODE_URL } from './utils/constant';

export const nonceArgument = new Argument('<nonce>', 'Unique number that is required to sign transaction securely')
  .argParser((nonce) => +nonce);

export const nodeOption = new Option('-u, --url [hostname]', 'Node to connect to')
  .default(NODE_URL, 'Aeternity testnet');

export const jsonOption = new Option('--json', 'Print result in json format');

export const gasOption = new Option('-G --gas [gas]', 'Amount of gas to call/deploy the contract')
  .argParser((gas) => +gas)
  .default(GAS_MAX, 'Maximum amount of gas that can be executed in a block');
