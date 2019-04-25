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

import fs from 'fs'
import { before, describe, it } from 'mocha'

import { configure, plan, ready, parseBlock, KEY_PAIR, WALLET_NAME, execute as exec } from './index'

// CONTRACT DESCRIPTOR
const testContract = `contract Identity =
  type state = ()
  function main(x : int, y: int) = x + y
`
const contractCall = `contract StateContract =
  function main : (int, int) => int
  function __call() = main(1,2)`

const encodedNumber3 = 'cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPJ9AW0'
const CALL_DATA = 'cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACD2yeBkazjNGxosFNO2BCRHh7eGNLVLUkTmDvM0oh3VAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAu/rRss='
const DECODED_CALL_DATA = { arguments: [ { type: 'word', value: 1 }, { type: 'word', value: 2 } ], function: 'main' }

plan(1000000000)
const execute = (arg) => exec(arg, { withNetworkId: true })

describe('CLI Contract Module', function () {
  configure(this)
  const contractFile = 'testContract'
  let cAddress
  let deployDescriptor
  let wallet
  let bytecode

  before(async function () {
    // Spend tokens for wallet
    wallet = await ready(this)
    fs.writeFileSync('callC', contractCall)
  })
  after(function () {
    // Remove wallet files
    if (fs.existsSync(WALLET_NAME)) { fs.unlinkSync(WALLET_NAME) }
    if (fs.existsSync(`${WALLET_NAME}.pub`)) { fs.unlinkSync(`${WALLET_NAME}.pub`) }

    // Remove contract files
    if (fs.existsSync(deployDescriptor)) { fs.unlinkSync(deployDescriptor) }
    if (fs.existsSync(contractFile)) { fs.unlinkSync(contractFile) }
    if (fs.existsSync('callC')) { fs.unlinkSync('callC') }
  })

  it('Compile Contract', async () => {
    // Create contract file
    fs.writeFileSync(contractFile, testContract)

    // Compile contract
    const compiled = await wallet.contractCompile(testContract)
    const compiledCLI = (await exec(['contract', 'compile', contractFile]))
    const bytecodeCLI = compiledCLI.split(':')[1].trim()
    bytecode = compiled.bytecode

    bytecodeCLI.should.equal(compiled.bytecode)
  })

  it('Encode callData', async () => {
    const { callData } = JSON.parse(await exec(['contract', 'encodeData', contractFile, 'main', 1, 2, '--json']))
    callData.should.be.equal(CALL_DATA)
  })

  it('Decode callData', async () => {
    const { decoded } = JSON.parse(await exec(['contract', 'decodeCallData', CALL_DATA, '--code', bytecode, '--json']))
    return Promise.resolve(decoded).should.eventually.become(DECODED_CALL_DATA)
  })

  it('Decode Data', async () => {
    const { decodedData } = JSON.parse(await exec(['contract', 'decodeData', encodedNumber3, 'int', '--json']))
    decodedData.value.should.be.equal(3)
  })

  it('Deploy Contract', async () => {
    // Create contract file
    fs.writeFileSync(contractFile, testContract)

    // Deploy contract
    const res = await execute(['contract', 'deploy', WALLET_NAME, '--password', 'test', contractFile])
    const { contract_address, transaction_hash, deploy_descriptor } = (parseBlock(res))
    deployDescriptor = deploy_descriptor
    const [name, pref, address] = deployDescriptor.split('.')
    cAddress = contract_address
    contract_address.should.be.ok
    transaction_hash.should.be.ok
    name.should.equal(contractFile)
    pref.should.equal('deploy')
    address.should.equal(KEY_PAIR.publicKey.split('_')[1])
  })

  it('Call Contract by descriptor', async () => {
    // Call contract
    const callResponse = (parseBlock(await execute(['contract', 'call', WALLET_NAME, '--password', 'test', '--descrPath', deployDescriptor, 'main', 'int', '1', '2'])))
    const isValid = callResponse['return_value_(encoded)'].indexOf('cb_') !== -1
    isValid.should.be.equal(true)
    callResponse['return_value_(decoded)'].should.equal('3')
  })
  it('Call Contract static by descriptor', async () => {
    // Call contract
    const callResponse = (parseBlock(await execute(['contract', 'call', WALLET_NAME, '--password', 'test', '--descrPath', deployDescriptor, 'main', 'int', '1', '2', '--callStatic'])))
    const isValid = callResponse['return_value_(encoded)'].indexOf('cb_') !== -1
    isValid.should.be.equal(true)
    callResponse['return_value_(decoded)'].should.equal('3')
  })
  it('Call Contract by contract address', async () => {
    const callResponse = (parseBlock(await execute(['contract', 'call', WALLET_NAME, '--password', 'test', '--contractAddress', cAddress, '--contractSource', contractFile, 'main', 'int', '1', '2'])))
    const isValid = callResponse['return_value_(encoded)'].indexOf('cb_') !== -1
    isValid.should.be.equal(true)
    callResponse['return_value_(decoded)'].should.equal('3')
  })
  it('Call Contract static by contract address', async () => {
    const callResponse = (parseBlock(await execute(['contract', 'call', WALLET_NAME, '--password', 'test', '--contractAddress', cAddress, '--contractSource', contractFile, 'main', 'int', '1', '2', '--callStatic'])))
    const isValid = callResponse['return_value_(encoded)'].indexOf('cb_') !== -1

    isValid.should.be.equal(true)
    callResponse['return_value_(decoded)'].should.equal('3')
  })
})
