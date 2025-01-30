import fs from 'fs-extra';
import { encode, Contract } from '@aeternity/aepp-sdk';
import { initSdk, initSdkByWalletFile } from '../utils/cli.js';
import { print, printTable, printTransaction } from '../utils/print.js';
import CliError from '../utils/CliError.js';
import { formatCoins, getFullPath } from '../utils/helpers.js';

const DESCRIPTOR_VERSION = 1;

async function getContractParams(
  { descrPath, contractAddress, contractSource, contractBytecode, contractAci },
  { dummyBytecode, descrMayNotExist } = {},
) {
  let descriptor = {};
  if (descrPath && (!descrMayNotExist || (await fs.exists(getFullPath(descrPath))))) {
    descriptor = await fs.readJson(getFullPath(descrPath));
    if (descriptor.version !== DESCRIPTOR_VERSION) {
      throw new CliError(
        `Unsupported contract descriptor: version ${descriptor.version}, supported ${DESCRIPTOR_VERSION}`,
      );
    }
  }
  const { address, ...other } = descriptor;
  return {
    address: contractAddress ?? address,
    // TODO: either remove calldata methods in cli or reconsider Contract::initialize requirements
    ...(dummyBytecode && { bytecode: 'cb_invalid-bytecode' }),
    ...other,
    ...(contractSource && { sourceCodePath: contractSource }),
    ...(contractBytecode && {
      bytecode: encode(await fs.readFile(getFullPath(contractBytecode)), 'cb'),
    }),
    ...(contractAci && { aci: await fs.readJson(getFullPath(contractAci)) }),
  };
}

export async function compile(contractSource, options) {
  const aeSdk = initSdk(options);
  const contract = await Contract.initialize({
    ...aeSdk.getContext(),
    sourceCodePath: contractSource,
  });
  const bytecode = await contract.$compile();
  if (options.json) print({ bytecode });
  else print(`Contract bytecode: ${bytecode}`);
}

export async function encodeCalldata(fn, args, options) {
  const aeSdk = initSdk(options);
  const contractParams = await getContractParams(options, {
    dummyBytecode: true,
  });
  delete contractParams.address; // TODO: remove after dropping Iris support
  const contract = await Contract.initialize({
    ...aeSdk.getContext(),
    ...contractParams,
  });
  const calldata = contract._calldata.encode(contract._name, fn, args);
  if (options.json) print({ calldata });
  else print(`Contract encoded calldata: ${calldata}`);
}

export async function decodeCallResult(fn, calldata, options) {
  const aeSdk = initSdk(options);
  const contract = await Contract.initialize({
    ...aeSdk.getContext(),
    ...(await getContractParams(options, { dummyBytecode: true })),
  });
  const decoded = contract._calldata.decode(contract._name, fn, calldata);
  if (options.json) print({ decoded });
  else {
    print('Contract decoded call result:');
    print(decoded);
  }
}

export async function deploy(walletPath, args, options) {
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  const contract = await Contract.initialize({
    ...aeSdk.getContext(),
    ...(await getContractParams(options, { descrMayNotExist: true })),
  });
  const result = await contract.$deploy(args, options);
  const filename = options.contractSource ?? options.contractBytecode;
  options.descrPath ??= getFullPath(`${filename}.deploy.${result.address.slice(3)}.json`);
  const descriptor = {
    version: DESCRIPTOR_VERSION,
    address: result.address,
    bytecode: contract.$options.bytecode,
    aci: contract._aci,
  };
  await fs.outputJson(options.descrPath, descriptor);
  if (options.json) print({ ...result, descrPath: options.descrPath });
  else {
    print('Contract was successfully deployed');
    printTable([
      ['Contract address', result.address],
      ['Transaction hash', result.transaction],
      ['Deploy descriptor', options.descrPath],
    ]);
  }
}

export async function call(fn, args, walletPath, options) {
  const { callStatic, json, top, ttl, gas, gasPrice, nonce, amount } = options;
  if (callStatic !== true && walletPath == null) {
    throw new CliError('wallet_path is required for on-chain calls');
  }
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  const contract = await Contract.initialize({
    ...aeSdk.getContext(),
    ...(await getContractParams(options)),
  });
  const callResult = await contract.$call(fn, args, {
    ttl: ttl && +ttl,
    gas,
    gasPrice,
    nonce: nonce && +nonce,
    callStatic,
    top,
    amount,
  });
  if (json) print(callResult);
  else {
    await printTransaction(
      callStatic
        ? { ...callResult, type: 'ContractCallTx', blockHash: 'N/A', signatures: 'N/A' }
        : callResult.txData,
      json,
      aeSdk,
    );
    print('----------------------Call info-----------------------');
    const gasCoins =
      BigInt(callResult.result.gasUsed) *
      (callStatic ? BigInt(callResult.tx.gasPrice) : callResult.txData.tx.gasPrice);
    printTable([
      ['Gas used', `${callResult.result.gasUsed} (${formatCoins(gasCoins)})`],
      ['Return value (encoded)', callResult.result.returnValue],
      ['Return value (decoded)', callResult.decodedResult],
    ]);
  }
}
