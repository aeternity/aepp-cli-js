import { Argument, Option } from 'commander';
import BigNumber from 'bignumber.js';
import { MIN_GAS_PRICE } from '@aeternity/aepp-sdk';
import { noValue } from './utils/default-option-description.js';
import { nameTtl, nameClientTtl, oracleTtl, queryTtl, responseTtl } from './utils/sdk-defaults.js';
import { formatBlocks, formatSeconds } from './utils/helpers.js';

export const coinAmountParser = (amount) => {
  if (amount.endsWith('ae')) return new BigNumber(amount.slice(0, -2)).shiftedBy(18);
  return new BigNumber(amount);
};

export const amountOption = new Option('-a, --amount [amount]', 'Amount of coins to send')
  .default(0, '0ae')
  .argParser(coinAmountParser);

export const feeOption = new Option('-F, --fee [fee]', 'Override the transaction fee').argParser(
  coinAmountParser,
);

export const nameFeeOption = new Option(
  '--nameFee [nameFee]',
  'Amount of coins to pay for name',
).argParser(coinAmountParser);

export const nameTtlArgument = new Argument(
  '[nameTtl]',
  'A number of blocks until name expires',
).default(nameTtl, formatBlocks(nameTtl));

export const nameTtlOption = new Option(
  '--nameTtl [nameTtl]',
  'A number of blocks until name expires',
).default(nameTtl, formatBlocks(nameTtl));

export const oracleTtlArgument = new Argument(
  '[oracleTtl]',
  'A number of blocks until oracle expires',
).default(oracleTtl, formatBlocks(oracleTtl));

export const oracleTtlOption = new Option(
  '--oracleTtl [oracleTtl]',
  'A number of blocks until oracle expires',
).default(oracleTtl, formatBlocks(oracleTtl));

export const queryTtlOption = new Option(
  '--queryTtl [queryTtl]',
  'A number of blocks while oracle can respond',
).default(queryTtl, formatBlocks(queryTtl));

export const responseTtlOption = new Option(
  '--responseTtl [responseTtl]',
  'A number of blocks while response available',
).default(responseTtl, formatBlocks(responseTtl));

export const queryFeeOption = (isCreate) =>
  new Option('--queryFee [queryFee]', 'Oracle query fee')
    .default(...(isCreate ? [0, '0ae'] : [noValue, 'provided by oracle']))
    .argParser(coinAmountParser);

export const nodeOption = new Option('-u, --url [nodeUrl]', 'Node to connect to')
  .default('https://mainnet.aeternity.io', 'mainnet')
  .env('AECLI_NODE_URL');

export const compilerOption = new Option('--compilerUrl [compilerUrl]', 'Compiler to connect to')
  .default('https://v8.compiler.aepps.com', 'stable compiler')
  .env('AECLI_COMPILER_URL');

export const jsonOption = new Option('--json', 'Print result in json format');

export const gasOption = new Option(
  '-G, --gas [gas]',
  'Amount of gas to call/deploy the contract',
).argParser((gas) => +gas);

export const gasPriceOption = (usingNode) =>
  new Option('--gasPrice [gasPrice]', 'Gas price to call/deploy the contract').default(
    noValue,
    usingNode ? 'based on network demand' : MIN_GAS_PRICE,
  );

export const forceOption = new Option('-f, --force', 'Ignore node version compatibility check');

export const passwordOption = new Option(
  '-P, --password [password]',
  'Wallet Password, may be recorded to shell history',
).env('AECLI_WALLET_PASSWORD');

export const ttlOption = (usingNode) =>
  new Option(
    '-T, --ttl [ttl]',
    'Validity of the transaction in number of keyblocks, or without this limit if 0',
  ).default(noValue, usingNode ? 3 : 0);

export const networkIdOption = new Option('--networkId [networkId]', 'Network id');

export const clientTtlOption = new Option(
  '--clientTtl [clientTtl]',
  'a suggestion measured in seconds on how long clients should cache name pointers',
).default(nameClientTtl, formatSeconds(nameClientTtl));
