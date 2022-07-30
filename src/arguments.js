import { Argument, Option } from 'commander';
import { NODE_URL } from './utils/constant';

export const nonceArgument = new Argument('<nonce>', 'Unique number that is required to sign transaction securely')
  .argParser((nonce) => +nonce);

export const nodeOption = new Option('-u, --url [hostname]', 'Node to connect to')
  .default(NODE_URL, 'Aeternity testnet');

export const jsonOption = new Option('--json', 'Print result in json format');

export const gasOption = new Option('-G --gas [gas]', 'Amount of gas to call/deploy the contract')
  .argParser((gas) => +gas);
