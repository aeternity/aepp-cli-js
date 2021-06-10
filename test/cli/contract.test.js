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
import { before, after, describe, it } from 'mocha'

import { configure, plan, ready, WALLET_NAME, execute as exec, KEY_PAIR } from './index'

// CONTRACT SOURCE
const testContract = `contract Identity =
  entrypoint main(x : int, y: int) = x + y
`

const CALL_DATA = 'cb_KxG4F37sKwIEFmEjaA=='
const DECODED_CALL_DATA = { arguments: [{ type: 'int', value: 1 }, { type: 'int', value: 2 }], function: 'main' }

plan(1000000000)

describe('CLI Contract Module', function () {
  configure(this)
  const contractFile = 'testContract'
  let deployDescriptor
  let wallet
  let bytecode
  let cAddress

  before(async function () {
    // Spend tokens for wallet
    fs.writeFileSync(contractFile, testContract)
    wallet = await ready(this)
  })

  after(function () {
    // Remove wallet files
    if (fs.existsSync(WALLET_NAME)) { fs.unlinkSync(WALLET_NAME) }
    if (fs.existsSync(`${WALLET_NAME}.pub`)) { fs.unlinkSync(`${WALLET_NAME}.pub`) }

    // Remove contract files
    if (fs.existsSync(deployDescriptor)) { fs.unlinkSync(deployDescriptor) }
    if (fs.existsSync(contractFile)) { fs.unlinkSync(contractFile) }
  })

  it('Compile Contract', async () => {
    // Create contract file
    // Compile contract
    const compiled = await wallet.contractCompile(testContract)
    const compiledCLI = (await exec(['contract', 'compile', contractFile]))
    const bytecodeCLI = compiledCLI.split(':')[1].trim()
    bytecode = compiled.bytecode

    bytecodeCLI.should.equal(compiled.bytecode)
  })

  it('Encode callData', async () => {
    const { callData } = JSON.parse(await exec(['contract', 'encodeData', contractFile, 'main', '1', '2', '--json']))
    callData.should.be.equal(CALL_DATA)
  })

  it('Decode callData', async () => {
    const { decoded } = JSON.parse(await exec(['contract', 'decodeCallData', CALL_DATA, '--code', bytecode, '--json']))
    return Promise.resolve(decoded).should.eventually.become(DECODED_CALL_DATA)
  })

  it('Deploy Contract', async () => {
    // Create contract file
    fs.writeFileSync(contractFile, testContract)

    // Deploy contract
    const { callData } = JSON.parse(await exec(['contract', 'encodeData', contractFile, 'init', '--json']))
    const resRaw = await exec(['contract', 'deploy', WALLET_NAME, '--password', 'test', contractFile, callData, '--json'])
    const res = JSON.parse(resRaw)
    const { result: { contractId }, transaction, descPath } = res
    deployDescriptor = descPath
    const [name, pref, add] = deployDescriptor.split('.')
    cAddress = contractId
    contractId.should.be.a('string')
    transaction.should.be.a('string')
    name.should.equal(contractFile)
    pref.should.equal('deploy')
    add.should.equal(KEY_PAIR.publicKey.split('_')[1])
  })

  it('Call Contract by descriptor', async () => {
    // Call contract
    const res = await exec(['contract', 'call', WALLET_NAME, '--password', 'test', '--json', '--descrPath', deployDescriptor, 'main', '1', '2'])
    const callResponse = JSON.parse(res)
    callResponse.result.returnValue.should.contain('cb_')
    callResponse.decodedResult.should.equal(3)
  })
  it('Call Contract static by descriptor', async () => {
    // Call contract
    const callResponse = (JSON.parse(await exec(['contract', 'call', WALLET_NAME, '--password', 'test', '--json', '--descrPath', deployDescriptor, 'main', '1', '2', '--callStatic'])))
    callResponse.result.returnValue.should.contain('cb_')
    callResponse.decodedResult.should.equal(3)
  })
  it('Call Contract by contract address', async () => {
    const callResponse = (JSON.parse(await exec(['contract', 'call', WALLET_NAME, '--password', 'test', '--json', '--contractAddress', cAddress, '--contractSource', contractFile, 'main', '1', '2'])))
    callResponse.result.returnValue.should.contain('cb_')
    callResponse.decodedResult.should.equal(3)
  })
  it('Call Contract static by contract address', async () => {
    const callResponse = (JSON.parse(await exec(['contract', 'call', WALLET_NAME, '--password', 'test', '--json', '--contractAddress', cAddress, '--contractSource', contractFile, 'main', '1', '2', '--callStatic'])))
    callResponse.result.returnValue.should.contain('cb_')
    callResponse.decodedResult.should.equal(3)
  })
})
