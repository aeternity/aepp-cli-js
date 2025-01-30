import BigNumber from 'bignumber.js';
import { resolve } from 'path';
import { Encoding, decode as _decode, produceNameId } from '@aeternity/aepp-sdk';
import CliError from './CliError.js';

export const exampleAddress1 = 'ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E';
export const exampleAddress2 = 'ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT';
export const exampleContract = 'ct_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh';
export const exampleOracle = 'ok_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi';
export const exampleOracleQuery = 'oq_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh';
export const exampleTransaction =
  'tx_+FoMAaEBzqet5HDJ+Z2dTkAIgKhvHUm7REti8Rqeu2S7z+tz/vOhARX7Ovvi4N8rfRN/Dsvb2ei7AJ3ysIkBrG5pnY6qW3W7iQVrx14tYxAAAIYPUN430AAAKoBebL57';
export const exampleName = 'example-name.chain';
export const exampleCalldata = 'cb_DA6sWJo=';
export const exampleHeight = 929796;

export const commandExamples = new WeakMap();

export const addExamples = (command, examples) => {
  commandExamples.set(command, examples);
  command.addHelpText('after', () => {
    let name = '';
    let cmd = command;
    while (cmd) {
      name = `${cmd.name()} ${name}`;
      cmd = cmd.parent;
    }
    return ['', 'Example calls:', ...examples.map((e) => `  $ ${name}${e}`)].join('\n');
  });
};

export async function getBlock(hash, aeSdk) {
  const type = hash.split('_')[0];
  switch (type) {
    case Encoding.KeyBlockHash:
      return aeSdk.api.getKeyBlockByHash(hash);
    case Encoding.MicroBlockHash:
      return {
        ...(await aeSdk.api.getMicroBlockHeaderByHash(hash)),
        ...(await aeSdk.api.getMicroBlockTransactionsByHash(hash)),
      };
    default:
      throw new CliError(`Unknown block hash type: ${type}`);
  }
}

// TODO: move to sdk side (combine with decode)
export function checkPref(hash, hashType) {
  if (hash.length < 3 || hash.indexOf('_') === -1) {
    throw new CliError('Invalid input, likely you forgot to escape the $ sign (use \\_)');
  }

  if (Array.isArray(hashType)) {
    const res = hashType.find((ht) => hash.startsWith(`${ht}_`));
    if (res) return;
    throw new CliError('Invalid block hash, it should be like: mh_.... or kh._...');
  }

  if (!hash.startsWith(`${hashType}_`)) {
    const msg =
      {
        [Encoding.TxHash]: 'Invalid transaction hash, it should be like: th_....',
        [Encoding.AccountAddress]: 'Invalid account address, it should be like: ak_....',
      }[hashType] || `Invalid hash, it should be like: ${hashType}_....`;
    throw new CliError(msg);
  }
}

export async function getNameEntry(nameAsString, aeSdk) {
  const [name, auction] = await Promise.all([
    aeSdk.api.getNameEntryByName(nameAsString).catch((error) => {
      if (error.response?.status === 404) {
        return error.response.parsedBody?.reason === 'Name revoked' ? 'REVOKED' : 'AVAILABLE';
      }
      throw error;
    }),
    aeSdk.api.getAuctionEntryByName(nameAsString).catch((error) => {
      if (error.response?.status === 404) return undefined;
      throw error;
    }),
  ]);
  if (auction) return { ...auction, status: 'AUCTION' };
  if (typeof name === 'object') return { ...name, status: 'CLAIMED' };
  return { id: produceNameId(nameAsString), status: name };
}

export function validateName(name) {
  if (typeof name !== 'string') throw new CliError('Name must be a string');
  if (!name.endsWith('.chain')) throw new CliError(`Name should end with .chain: ${name}`);
}

export function decode(data, requiredPrefix) {
  if (typeof data !== 'string') throw new CliError('Data must be a string');
  const prefix = data.split('_')[0];
  if (prefix !== requiredPrefix) {
    throw new CliError(`Encoded string have a wrong type: ${prefix} (expected: ${requiredPrefix})`);
  }
  return _decode(data);
}

export const getFullPath = (path) => resolve(process.cwd(), path);

const timeUnits = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30.5 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

const secondsToBiggerUnit = (seconds) => {
  for (const [name, size] of timeUnits) {
    const value = Math.floor(seconds / size);
    if (value > 0) {
      const plural = value > 1 ? 's' : '';
      return `${value} ${name}${plural}`;
    }
  }
  return '0 seconds';
};

const timeAgo = (date) => {
  const diff = (Date.now() - date.getTime()) / 1000;
  const description = secondsToBiggerUnit(Math.abs(diff));
  if (description === '0 seconds') return 'about now';
  return diff > 0 ? `${description} ago` : `in ${description}`;
};

export const formatCoins = (coins) => `${new BigNumber(coins).shiftedBy(-18).toFixed()}ae`;

const blocksIntervalInSeconds = 3 * 60;

export const formatTtl = (ttl, height) => {
  const diff = Math.abs(ttl - height) < 2 ? 0 : ttl - height;
  const date = new Date();
  date.setSeconds(date.getSeconds() + diff * blocksIntervalInSeconds);
  return `${ttl} (${timeAgo(date)})`;
};

export const formatBlocks = (blocks) => {
  return `${blocks} (${secondsToBiggerUnit(blocks * blocksIntervalInSeconds)})`;
};

export const formatSeconds = (seconds) => {
  return `${seconds} (${secondsToBiggerUnit(seconds)})`;
};
