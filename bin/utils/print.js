/*
* ISC License (ISC)
* Copyright (c) 2018 aeternity developers
*
*  Permission to use, copy, modify, and/or distribute this software for any
                                                                        *  purpose with or without fee is hereby granted, provided that the above
*  copyright notice and this permission notice appear in all copies.
*
*  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
*  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
*  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
*  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
*  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
*  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
*  PERFORMANCE OF THIS SOFTWARE.
*/
// # Utils `print` Module
// That script contains helper function for `console` print
import { HASH_TYPES } from './constant'
import { Crypto, TxBuilder } from '@aeternity/aepp-sdk'

// ## CONSTANT
const TX_TYPE_PRINT_MAP = {
  SpendTx: printSpendTransaction,
  ContractCreateTx: printContractCreateTransaction,
  ContractCallTx: printContractCallTransaction,
  NamePreclaimTx: printNamePreclaimTransaction,
  NameClaimTx: printNameClaimTransaction,
  NameTransferTx: printNameTransferTransaction,
  NameUpdateTx: printNameUpdateTransaction,
  NameRevokeTx: printNameRevokeTransaction,
  OracleRegisterTx: printOracleRegisterTransaction,
  OracleQueryTx: printOraclePostQueryTransaction,
  OracleExtendTx: printOracleExtendTransaction,
  OracleRespondTx: printOracleResponseTransaction
}
// ## Row width
const WIDTH = 40

// ## CONSOLE PRINT HELPERS

// Calculate tabs length
function getTabs (tabs) {
  if (!tabs) return ''
  return ' '.repeat(tabs * 4)
}

const JsonStringifyBigInt = (object, replacer, space) =>
  JSON.stringify(
    object,
    (key, value) => typeof value === 'bigint' ? `${value}` : value,
    space
  )

// Print helper
export function print (msg, obj) {
  if (typeof msg === 'object') return console.log(JsonStringifyBigInt(msg))
  if (obj) {
    console.log(msg)
    console.log(JSON.stringify(obj))
  } else {
    console.log(msg)
  }
}

// Print error helper
export function printError (msg, obj) {
  console.log(msg, obj || '')
}

// Print `underscored`
export function printUnderscored (key, val) {
  print([
    key,
    '_'.repeat(WIDTH - key.length),
    typeof val !== 'object' ? val : JSON.stringify(val)
  ].join(' '))
}

// ## BLOCK
//
// Print block
export function printBlock (block, json) {
  if (json) {
    print(block)
    return
  }
  const type = Object.keys(HASH_TYPES).find(t => block.hash.split('_')[0] === HASH_TYPES[t])
  const tabs = type === 'MICRO_BLOCK' ? 1 : 0
  const tabString = getTabs(tabs)

  print(tabString + '<<--------------- ' + type.toUpperCase() + ' --------------->>')

  printUnderscored(tabString + 'Block hash', block.hash)
  printUnderscored(tabString + 'Block height', block.height)
  printUnderscored(tabString + 'State hash', block.stateHash)
  printUnderscored(tabString + 'Nonce', block.nonce ?? 'N/A')
  printUnderscored(tabString + 'Miner', block.miner ?? 'N/A')
  printUnderscored(tabString + 'Time', new Date(block.time))
  printUnderscored(tabString + 'Previous block hash', block.prevHash)
  printUnderscored(tabString + 'Previous key block hash', block.prevKeyHash)
  printUnderscored(tabString + 'Version', block.version)
  printUnderscored(tabString + 'Target', block.target ?? 'N/A')
  const txCount = block?.transactions?.length ?? 0
  printUnderscored(tabString + 'Transactions', txCount)
  if (txCount) printBlockTransactions(block.transactions, false, tabs + 1)

  print('<<------------------------------------->>')
}

// Print block `transactions`
export function printBlockTransactions (ts, json, tabs = 0) {
  if (json) {
    print(ts)
    return
  }
  const tabsString = getTabs(tabs)
  ts.forEach(
    (tx, i) => {
      print(tabsString + '----------------  TX  ----------------')
      printTransaction(tx, false, tabs + 1)
      print(tabsString + '--------------------------------------')
    })
}

// ## TX

export function printValidation ({ validation, transaction }) {
  print('---------------------------------------- TX DATA ↓↓↓ \n')
  const { tx, txType: type } = TxBuilder.unpackTx(transaction)
  Object.entries({ ...tx, type }).forEach(([key, value]) => printUnderscored(key, value))
  print('\n---------------------------------------- ERRORS ↓↓↓ \n')
  validation.forEach(({ message, checkedKeys }) => {
    printUnderscored(checkedKeys.join(', '), message)
  })
}

//
// Print base `tx` info
function printTxBase (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Tx hash', tx.hash)
  printUnderscored(tabs + 'Block hash', tx.blockHash)
  printUnderscored(tabs + 'Block height', tx.blockHeight)
  printUnderscored(tabs + 'Signatures', tx.signatures)

  printUnderscored(tabs + 'Tx Type', tx?.tx?.type ?? 'N/A')
}

// Print `contract_create_tx` info
function printContractCreateTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Owner', tx?.tx?.ownerId ?? 'N/A')
  printUnderscored(tabs + 'Amount', tx?.tx?.amount ?? 'N/A')
  printUnderscored(tabs + 'Deposit', tx?.tx?.deposit ?? 'N/A')
  printUnderscored(tabs + 'Gas', tx?.tx?.gas ?? 'N/A')
  printUnderscored(tabs + 'Gas Price', tx?.tx?.gasPrice ?? 'N/A')
  printUnderscored(tabs + 'Payload', tx?.tx?.payload ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
  printUnderscored(tabs + 'Version', tx?.tx?.version ?? 'N/A')
  printUnderscored(tabs + 'VM Version', tx?.tx?.vmVersion ?? 'N/A')
  printUnderscored(tabs + 'ABI Version', tx?.tx?.abiVersion ?? 'N/A')
}

// Print `contract_call_tx` info
function printContractCallTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Caller Account', tx?.tx?.callerId ?? 'N/A')
  printUnderscored(tabs + 'Contract Hash', tx?.tx?.contractId ?? 'N/A')
  printUnderscored(tabs + 'Amount', tx?.tx?.amount ?? 0)
  printUnderscored(tabs + 'Deposit', tx?.tx?.deposit ?? 0)
  printUnderscored(tabs + 'Gas', tx?.tx?.gas ?? 0)
  printUnderscored(tabs + 'Gas Price', tx?.tx?.gasPrice ?? 0)
  printUnderscored(tabs + 'Payload', tx?.tx?.payload ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
  printUnderscored(tabs + 'Version', tx?.tx?.version ?? 0)
  printUnderscored(tabs + 'ABI Version', tx?.tx?.abiVersion ?? 0)
}

// Print `spend_tx` info
function printSpendTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Sender account', tx?.tx?.senderId ?? 'N/A')
  printUnderscored(tabs + 'Recipient account', tx?.tx?.recipientId ?? 'N/A')
  printUnderscored(tabs + 'Amount', tx?.tx?.amount ?? 'N/A')
  printUnderscored(tabs + 'Payload', tx?.tx?.payload ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
  printUnderscored(tabs + 'Version', tx?.tx?.version ?? 'N/A')
}

// Print `pre_claim_tx` info
function printNamePreclaimTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', tx?.tx?.accountId ?? 'N/A')
  printUnderscored(tabs + 'Commitment', tx?.tx?.commitmentId ?? 'N/A')
  printUnderscored(tabs + 'Salt', tx?.salt ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
  printUnderscored(tabs + 'Version', tx?.tx?.version ?? 'N/A')
}

// Print `claim_tx` info
function printNameClaimTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', tx?.tx?.accountId ?? 'N/A')
  printUnderscored(tabs + 'Name', tx?.tx?.name ?? 'N/A')
  printUnderscored(tabs + 'Name Fee', tx?.tx?.nameFee ?? 'N/A')
  printUnderscored(tabs + 'Name Salt', tx?.tx?.nameSalt ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
  printUnderscored(tabs + 'Version', tx?.tx?.version ?? 'N/A')
}

// Print `update_name_tx` info
function printNameUpdateTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', tx?.tx?.accountId ?? 'N/A')
  printUnderscored(tabs + 'Client TTL', tx?.tx?.clientTtl ?? 'N/A')
  printUnderscored(tabs + 'Name ID', tx?.tx?.nameId ?? 'N/A')
  printUnderscored(tabs + 'Name TTL', tx?.tx?.nameTtl ?? 'N/A')
  printUnderscored(tabs + 'Pointers', JSON.stringify(tx?.tx?.pointers) ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
  printUnderscored(tabs + 'Version', tx?.tx?.version ?? 'N/A')
}

// Print `transfer_name_tx` info
function printNameTransferTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', tx?.tx?.accountId ?? 'N/A')
  printUnderscored(tabs + 'Recipient', tx?.tx?.recipientId ?? 'N/A')
  printUnderscored(tabs + 'Name ID', tx?.tx?.nameId ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
  printUnderscored(tabs + 'Version', tx?.tx?.version ?? 'N/A')
}

// Print `revoke_name_tx` info
function printNameRevokeTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', tx?.tx?.accountId ?? 'N/A')
  printUnderscored(tabs + 'Name ID', tx?.tx?.nameId ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
  printUnderscored(tabs + 'Version', tx?.tx?.version ?? 'N/A')
}

// Print `oracle-register-tx` info
function printOracleRegisterTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', tx?.tx?.accountId ?? 'N/A')
  printUnderscored(tabs + 'Oracle ID', tx?.tx?.accountId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Query Fee', tx?.tx?.queryFee ?? 'N/A')
  printUnderscored(tabs + 'Oracle Ttl', tx?.tx?.oracleTtl ?? 'N/A')
  printUnderscored(tabs + 'Query Format', tx?.tx?.queryFormat ?? 'N/A')
  printUnderscored(tabs + 'Response Format', tx?.tx?.responseFormat ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
}

// Print `oracle-post-query` info
function printOraclePostQueryTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', tx?.tx?.senderId ?? 'N/A')
  printUnderscored(tabs + 'Oracle ID', tx?.tx?.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A')
  printUnderscored(tabs + 'Query ID', tx?.id ?? 'N/A')
  printUnderscored(tabs + 'Query', tx?.tx?.query ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Query Fee', tx?.tx?.queryFee ?? 'N/A')
  printUnderscored(tabs + 'Query Ttl', tx?.tx?.queryTtl ?? 'N/A')
  printUnderscored(tabs + 'Response Ttl', tx?.tx?.responseTtl ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
}

// Print `oracle-extend` info
function printOracleExtendTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Oracle ID', tx?.tx?.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Oracle Ttl', tx?.tx?.oracleTtl ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
}

// Print `oracle-response` info
function printOracleResponseTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Oracle ID', tx?.tx?.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A')
  printUnderscored(tabs + 'Query', tx?.tx?.queryId ?? 'N/A')

  printUnderscored(tabs + 'Fee', tx?.tx?.fee ?? 'N/A')
  printUnderscored(tabs + 'Response', tx?.tx?.response ?? 'N/A')
  printUnderscored(tabs + 'Response Ttl', tx?.tx?.responseTtl ?? 'N/A')
  printUnderscored(tabs + 'Nonce', tx?.tx?.nonce ?? 'N/A')
  printUnderscored(tabs + 'TTL', tx?.tx?.ttl ?? 'N/A')
}

function replaceAt (str, index, replacement) {
  return str.substr(0, index) + replacement + str.substr(index + replacement.length)
}

function printTxInfo (tx, tabs) {
  const type = tx?.tx?.type
  TX_TYPE_PRINT_MAP[replaceAt(type, 0, type[0].toUpperCase())](tx, tabs)
}
// Function which print `tx`
// Get type of `tx` to now which `print` method to use
export function printTransaction (tx, json, tabs = 0, skipBase = false) {
  if (json) {
    print(tx)
    return
  }
  const tabsString = getTabs(tabs)
  if (!skipBase) printTxBase({ ...tx, ...tx.tx ? tx.tx : {} }, tabsString)
  printTxInfo({ ...tx, ...tx.tx ? tx.tx : {} }, tabsString)
}

// ##OTHER
//

// Print `oracle`
export function printOracle (oracle, json) {
  if (json) {
    print(oracle)
    return
  }
  printUnderscored('Oracle ID', oracle.id ?? 'N/A')
  printUnderscored('Oracle Query Fee', oracle.queryFee ?? 'N/A')
  printUnderscored('Oracle Query Format', oracle.queryFormat ?? 'N/A')
  printUnderscored('Oracle Response Format', oracle.responseFormat ?? 'N/A')
  printUnderscored('Ttl', oracle.ttl ?? 'N/A')
}
// Print `oracle`
export function printQueries (queries = [], json) {
  if (json) {
    print(queries)
    return
  }
  print('')
  print('--------------------------------- QUERIES ------------------------------------')
  queries.forEach(q => {
    printUnderscored('Oracle ID', q.oracleId ?? 'N/A')
    printUnderscored('Query ID', q.id ?? 'N/A')
    printUnderscored('Fee', q.fee ?? 'N/A')
    printUnderscored('Query', q.query ?? 'N/A')
    printUnderscored('Query decoded', Crypto.decodeBase64Check(q.query.slice(3)).toString() ?? 'N/A')
    printUnderscored('Response', q.response ?? 'N/A')
    printUnderscored('Response decoded', Crypto.decodeBase64Check(q.response.slice(3)).toString() ?? 'N/A')
    printUnderscored('Response Ttl', q.responseTtl ?? 'N/A')
    printUnderscored('Sender Id', q.senderId ?? 'N/A')
    printUnderscored('Sender Nonce', q.senderNonce ?? 'N/A')
    printUnderscored('Ttl', q.ttl ?? 'N/A')
    print('------------------------------------------------------------------------------')
  })
}

// Print `name`
export function printName (name, json) {
  if (json) {
    print(name)
    return
  }
  printUnderscored('Status', name.status ?? 'N/A')
  printUnderscored('Name hash', name.id ?? 'N/A')
  printUnderscored('Pointers', JSON.stringify(name.pointers) ?? 'N/A')
  printUnderscored('TTL', name.ttl ?? 0)
}

// Print `contract_descriptor` file
export function printContractDescr (descriptor, json) {
  if (json) {
    print(descriptor)
    return
  }
  printUnderscored('Source ' + descriptor.source)
  printUnderscored('Bytecode ' + descriptor.bytecode)
  printUnderscored('Address ' + descriptor.address)
  printUnderscored('Transaction ' + descriptor.transaction)
  printUnderscored('Owner ' + descriptor.owner)
  printUnderscored('CreatedAt ' + descriptor.createdAt)
}

// Print `contract_descriptor` file base info
export function logContractDescriptor (desc, title = '', json) {
  if (json) {
    print(desc)
    return
  }
  print(`${title}`)
  printUnderscored('Contract address', desc.address)
  printUnderscored('Transaction hash', desc.transaction)
  printUnderscored('Deploy descriptor', desc.descPath)
}

// Print `config`
export function printConfig ({ host }) {
  print('WALLET_PUB' + process.env.WALLET_PUB)
  print('EPOCH_URL' + host)
}

// Print `Buider Transaction`
export function printBuilderTransaction ({ tx, txObject }, type) {
  printUnderscored('Transaction type', type)
  print('Summary')
  Object
    .entries(txObject)
    .forEach(([key, value]) => printUnderscored(`    ${key.toUpperCase()}`, value))
  print('Output')
  printUnderscored('    Encoded', tx)
  print('This is an unsigned transaction. Use `account sign` and `tx broadcast` to submit the transaction to the network, or verify that it will be accepted with `tx verify`.')
}
