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
import * as R from 'ramda'

import { HASH_TYPES } from './constant'

// ## CONSTANT
const TX_TYPE_PRINT_MAP = {
  'SpendTx': printSpendTransaction,
  'ContractCreateTx': printContractCreateTransaction,
  'ContractCallTx': printContractCallTransaction,
  'NamePreclaimTx': printNamePreclaimTransaction,
  'NameClaimTx': printNameClaimTransaction,
  'NameTransferTx': printNameTransferTransaction,
  'NameUpdateTx': printNameUpdateTransaction,
  'NameRevokeTx': printNameRevokeTransaction,
  'OracleRegisterTx': printOracleRegisterTransaction,
  'OracleQueryTx': printOraclePostQueryTransaction,
  'OracleExtendTx': printOracleExtendTransaction,
  'OracleResponseTx': printOracleResponseTransaction
}
// ## Row width
const WIDTH = 40

// ## CONSOLE PRINT HELPERS

// Calculate tabs length
function getTabs (tabs) {
  if (!tabs) return ''
  return R.repeat(' ', tabs * 4).reduce((a, b) => a += b, '')
}

// Print helper
export function print (msg, obj) {
  if (obj) { console.log(msg, obj) } else { console.log(msg) }
}

// Print error helper
export function printError (msg, obj) {
  console.log(msg, obj)
}

// Print `underscored`
export function printUnderscored (key, val) {
  print(`${key}${R.repeat('_', WIDTH - key.length).reduce((a, b) => a += b, '')} ${typeof val !== 'object' ? val : JSON.stringify(val)}`)
}

// ## BLOCK
//
// Print block
export function printBlock (block, json) {
  if (json) {
    print(block)
    return
  }
  const type = Object.keys(HASH_TYPES).find(t => R.head(block.hash.split('_')) === (HASH_TYPES[t]))
  const tabs = type === 'MICRO_BLOCK' ? 1 : 0
  const tabString = getTabs(tabs)

  print(tabString + '<<--------------- ' + type.toUpperCase() + ' --------------->>')

  printUnderscored(tabString + 'Block hash', R.prop('hash', block))
  printUnderscored(tabString + 'Block height', R.prop('height', block))
  printUnderscored(tabString + 'State hash', R.prop('stateHash', block))
  printUnderscored(tabString + 'Nonce', R.defaultTo('N/A', R.prop('nonce', block)))
  printUnderscored(tabString + 'Miner', R.defaultTo('N/A', R.prop('miner', block)))
  printUnderscored(tabString + 'Time', new Date(R.prop('time', block)))
  printUnderscored(tabString + 'Previous block hash', R.prop('prevHash', block))
  printUnderscored(tabString + 'Previous key block hash', R.prop('prevKeyHash', block))
  printUnderscored(tabString + 'Version', R.prop('version', block))
  printUnderscored(tabString + 'Target', R.defaultTo('N/A', R.prop('target', block)))
  printUnderscored(tabString + 'Transactions', R.defaultTo(0, R.path(['transactions', 'length'], block)))
  if (R.defaultTo(0, R.path(['transactions', 'length'], block)))
    printBlockTransactions(block.transactions, false, tabs + 1)

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

export function printValidation ({ validation, tx, txType }) {
  print('---------------------------------------- TX DATA ↓↓↓ \n')
  Object.entries({ ...{ type: txType }, ...tx }).forEach(([key, value]) => printUnderscored(key, value))
  validation
    .reduce(
      (acc, { msg, txKey, type }) => {
        type === 'error' ? acc[0].push({ msg, txKey }) : acc[1].push({ msg, txKey })
        return acc
      },
      [[], []]
    )
    .forEach((el, i) => {
      if (el.length) {
        i === 0
          ? print('\n---------------------------------------- ERRORS ↓↓↓ \n')
          : print('\n---------------------------------------- WARNINGS ↓↓↓ \n')
        el
          .forEach(({ msg, txKey }) => {
            printUnderscored(txKey, msg)
          })
      }
    })
}

//
// Print base `tx` info
function printTxBase (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Tx hash', tx.hash)
  printUnderscored(tabs + 'Block hash', tx.blockHash)
  printUnderscored(tabs + 'Block height', tx.blockHeight)
  printUnderscored(tabs + 'Signatures', tx.signatures)

  printUnderscored(tabs + 'Tx Type', R.defaultTo('N/A', R.path(['tx', 'type'], tx)))
}

// Print `contract_create_tx` info
function printContractCreateTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Owner', R.defaultTo('N/A', R.path(['tx', 'ownerId'], tx)))
  printUnderscored(tabs + 'Amount', R.defaultTo('N/A', R.path(['tx', 'amount'], tx)))
  printUnderscored(tabs + 'Deposit', R.defaultTo('N/A', R.path(['tx', 'deposit'], tx)))
  printUnderscored(tabs + 'Gas', R.defaultTo('N/A', R.path(['tx', 'gas'], tx)))
  printUnderscored(tabs + 'Gas Price', R.defaultTo('N/A', R.path(['tx', 'gasPrice'], tx)))
  printUnderscored(tabs + 'Payload', R.defaultTo('N/A', R.path(['tx', 'payload'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
  printUnderscored(tabs + 'Version', R.defaultTo('N/A', R.path(['tx', 'version'], tx)))
  printUnderscored(tabs + 'VM Version', R.defaultTo('N/A', R.path(['tx', 'vmVersion'], tx)))
}

// Print `contract_call_tx` info
function printContractCallTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Caller Account', R.defaultTo('N/A', R.path(['tx', 'callerId'], tx)))
  printUnderscored(tabs + 'Contract Hash', R.defaultTo('N/A', R.path(['tx', 'contractId'], tx)))
  printUnderscored(tabs + 'Amount', R.defaultTo(0, R.path(['tx', 'amount'], tx)))
  printUnderscored(tabs + 'Deposit', R.defaultTo(0, R.path(['tx', 'deposit'], tx)))
  printUnderscored(tabs + 'Gas', R.defaultTo(0, R.path(['tx', 'gas'], tx)))
  printUnderscored(tabs + 'Gas Price', R.defaultTo(0, R.path(['tx', 'gasPrice'], tx)))
  printUnderscored(tabs + 'Payload', R.defaultTo('N/A', R.path(['tx', 'payload'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo(0, R.path(['tx', 'ttl'], tx)))
  printUnderscored(tabs + 'Version', R.defaultTo(0, R.path(['tx', 'version'], tx)))
  printUnderscored(tabs + 'ABI Version', R.defaultTo(0, R.path(['tx', 'abiVersion'], tx)))
}

// Print `spend_tx` info
function printSpendTransaction (tx = {}, tabs = '') {

  printUnderscored(tabs + 'Sender account', R.defaultTo('N/A', R.path(['tx', 'senderId'], tx)))
  printUnderscored(tabs + 'Recipient account', R.defaultTo('N/A', R.path(['tx', 'recipientId'], tx)))
  printUnderscored(tabs + 'Amount', R.defaultTo('N/A', R.path(['tx', 'amount'], tx)))
  printUnderscored(tabs + 'Payload', R.defaultTo('N/A', R.path(['tx', 'payload'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
  printUnderscored(tabs + 'Version', R.defaultTo('N/A', R.path(['tx', 'version'], tx)))
}

// Print `pre_claim_tx` info
function printNamePreclaimTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', R.defaultTo('N/A', R.path(['tx', 'accountId'], tx)))
  printUnderscored(tabs + 'Commitment', R.defaultTo('N/A', R.path(['tx', 'commitmentId'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
  printUnderscored(tabs + 'Version', R.defaultTo('N/A', R.path(['tx', 'version'], tx)))
}

// Print `claim_tx` info
function printNameClaimTransaction (tx = {}, tabs = '') {

  printUnderscored(tabs + 'Account', R.defaultTo('N/A', R.path(['tx', 'accountId'], tx)))
  printUnderscored(tabs + 'Name', R.defaultTo('N/A', R.path(['tx', 'name'], tx)))
  printUnderscored(tabs + 'Name Salt', R.defaultTo('N/A', R.path(['tx', 'nameSalt'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
  printUnderscored(tabs + 'Version', R.defaultTo('N/A', R.path(['tx', 'version'], tx)))
}

// Print `update_name_tx` info
function printNameUpdateTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', R.defaultTo('N/A', R.path(['tx', 'accountId'], tx)))
  printUnderscored(tabs + 'Client TTL', R.defaultTo('N/A', R.path(['tx', 'clientTtl'], tx)))
  printUnderscored(tabs + 'Name ID', R.defaultTo('N/A', R.path(['tx', 'nameId'], tx)))
  printUnderscored(tabs + 'Name TTL', R.defaultTo('N/A', R.path(['tx', 'nameTtl'], tx)))
  printUnderscored(tabs + 'Pointers', R.defaultTo('N/A', JSON.stringify(R.path(['tx', 'pointers'], tx))))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
  printUnderscored(tabs + 'Version', R.defaultTo('N/A', R.path(['tx', 'version'], tx)))
}

// Print `transfer_name_tx` info
function printNameTransferTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', R.defaultTo('N/A', R.path(['tx', 'accountId'], tx)))
  printUnderscored(tabs + 'Recipient', R.defaultTo('N/A', R.path(['tx', 'recipientId'], tx)))
  printUnderscored(tabs + 'Name ID', R.defaultTo('N/A', R.path(['tx', 'nameId'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
  printUnderscored(tabs + 'Version', R.defaultTo('N/A', R.path(['tx', 'version'], tx)))
}

// Print `revoke_name_tx` info
function printNameRevokeTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', R.defaultTo('N/A', R.path(['tx', 'accountId'], tx)))
  printUnderscored(tabs + 'Name ID', R.defaultTo('N/A', R.path(['tx', 'nameId'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
  printUnderscored(tabs + 'Version', R.defaultTo('N/A', R.path(['tx', 'version'], tx)))
}

// Print `oracle-register-tx` info
function printOracleRegisterTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', R.defaultTo('N/A', R.path(['tx', 'accountId'], tx)))
  printUnderscored(tabs + 'Oracle ID', R.defaultTo('N/A', 'ok_' + R.path(['tx', 'accountId'], tx).slice(3)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Query Fee', R.defaultTo('N/A', R.path(['tx', 'queryFee'], tx)))
  printUnderscored(tabs + 'Oracle Ttl', R.defaultTo('N/A', R.path(['tx', 'oracleTtl'], tx)))
  printUnderscored(tabs + 'Query Format', R.defaultTo('N/A', R.path(['tx', 'queryFormat'], tx)))
  printUnderscored(tabs + 'Response Format', R.defaultTo('N/A', R.path(['tx', 'responseFormat'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
}

// Print `oracle-post-query` info
function printOraclePostQueryTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Account', R.defaultTo('N/A', R.path(['tx', 'senderId'], tx)))
  printUnderscored(tabs + 'Oracle ID', R.defaultTo('N/A', 'ok_' + R.path(['tx', 'oracleId'], tx).slice(3)))
  printUnderscored(tabs + 'Query', R.defaultTo('N/A', R.path(['tx', 'query'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Query Fee', R.defaultTo('N/A', R.path(['tx', 'queryFee'], tx)))
  printUnderscored(tabs + 'Query Ttl', R.defaultTo('N/A', R.path(['tx', 'queryTtl'], tx)))
  printUnderscored(tabs + 'Response Ttl', R.defaultTo('N/A', R.path(['tx', 'responseTtl'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
}

// Print `oracle-extend` info
function printOracleExtendTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Oracle ID', R.defaultTo('N/A', 'ok_' + R.path(['tx', 'oracleId'], tx).slice(3)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Oracle Ttl', R.defaultTo('N/A', R.path(['tx', 'oracleTtl'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
}

// Print `oracle-response` info
function printOracleResponseTransaction (tx = {}, tabs = '') {
  printUnderscored(tabs + 'Oracle ID', R.defaultTo('N/A', 'ok_' + R.path(['tx', 'oracleId'], tx).slice(3)))
  printUnderscored(tabs + 'Query', R.defaultTo('N/A', R.path(['tx', 'queryId'], tx)))

  printUnderscored(tabs + 'Fee', R.defaultTo('N/A', R.path(['tx', 'fee'], tx)))
  printUnderscored(tabs + 'Response', R.defaultTo('N/A', R.path(['tx', 'response'], tx)))
  printUnderscored(tabs + 'Response Ttl', R.defaultTo('N/A', R.path(['tx', 'responseTtl'], tx)))
  printUnderscored(tabs + 'Nonce', R.defaultTo('N/A', R.path(['tx', 'nonce'], tx)))
  printUnderscored(tabs + 'TTL', R.defaultTo('N/A', R.path(['tx', 'ttl'], tx)))
}

function replaceAt (str, index, replacement) {
  return str.substr(0, index) + replacement + str.substr(index + replacement.length)
}

function printTxInfo (tx, tabs) {
  let type = R.path(['tx', 'type'], tx)
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
  if (!skipBase) printTxBase(tx, tabsString)
  printTxInfo(tx, tabsString)
}

// ##OTHER
//

// Print `oracle`
export function printOracle (oracle, json) {
  if (json) {
    print(oracle)
    return
  }
  printUnderscored('Oracle ID', R.defaultTo('N/A', R.prop('id', oracle)))
  printUnderscored('Oracle Query Fee', R.defaultTo('N/A', R.prop('queryFee', oracle)))
  printUnderscored('Oracle Query Format', R.defaultTo('N/A', R.prop('queryFormat', oracle)))
  printUnderscored('Oracle Response Format', R.defaultTo('N/A', R.prop('responseFormat', oracle)))
  printUnderscored('Ttl', R.defaultTo('N/A', R.prop('ttl', oracle)))
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
    printUnderscored('Oracle ID', R.defaultTo('N/A', R.prop('oracleId', q)))
    printUnderscored('Query ID', R.defaultTo('N/A', R.prop('id', q)))
    printUnderscored('Fee', R.defaultTo('N/A', R.prop('fee', q)))
    printUnderscored('Query', R.defaultTo('N/A', R.prop('query', q)))
    printUnderscored('Response', R.defaultTo('N/A', R.prop('response', q)))
    printUnderscored('Response Ttl', R.defaultTo('N/A', R.prop('responseTtl', q)))
    printUnderscored('Sender Id', R.defaultTo('N/A', R.prop('senderId', q)))
    printUnderscored('Sender Nonce', R.defaultTo('N/A', R.prop('senderNonce', q)))
    printUnderscored('Ttl', R.defaultTo('N/A', R.prop('ttl', q)))
    print('------------------------------------------------------------------------------')
  })
}

// Print `name`
export function printName (name, json) {
  if (json) {
    print(name)
    return
  }
  printUnderscored('Status', R.defaultTo('N/A', R.prop('status', name)))
  printUnderscored('Name hash', R.defaultTo('N/A', R.prop('id', name)))
  printUnderscored('Pointers', R.defaultTo('N/A', JSON.stringify(R.prop('pointers', name))))
  printUnderscored('TTL', R.defaultTo(0, R.prop('ttl', name)))
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
  print('WALLET_PUB' + process.env['WALLET_PUB'])
  print('EPOCH_URL' + host)
}
