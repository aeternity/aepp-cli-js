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
import { after, before, describe, it } from 'mocha'
import { executeProgram, getSdk, WALLET_NAME } from './index'
import contractProgramFactory from '../src/commands/contract'

const executeContract = args => executeProgram(contractProgramFactory, args)

const testContractSource = `
@compiler >= 6

contract Identity =
  entrypoint test(x : int, y: int) = x + y
`

const CALL_DATA = 'cb_KxGSiyA2KwIEFfUrtQ=='
const DECODED_CALL_DATA = { arguments: [{ type: 'int', value: 1 }, { type: 'int', value: 2 }], function: 'test' }

describe('CLI Contract Module', function () {
  const contractFile = 'testContract'
  let deployDescriptor, sdk, bytecode, cAddress

  before(async function () {
    fs.writeFileSync(contractFile, testContractSource)
    sdk = await getSdk()
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
    const compiled = await sdk.contractCompile(testContractSource).catch(console.error)
    const compiledCLI = await executeContract(['compile', contractFile])
    const bytecodeCLI = compiledCLI.split(':')[1].trim()
    bytecode = compiled.bytecode

    bytecodeCLI.should.be.equal(compiled.bytecode)
  })

  it('Encode callData', async () => {
    const { callData } = await executeContract(['encodeData', contractFile, 'test', '1', '2', '--json'])
    callData.should.be.equal(CALL_DATA)
  })

  it('Decode callData', async () => {
    const { decoded } = await executeContract(['decodeCallData', CALL_DATA, '--code', bytecode, '--json'])
    decoded.should.be.eql(DECODED_CALL_DATA)
  })

  it('Deploy Contract', async () => {
    const { callData } = await executeContract(['encodeData', contractFile, 'init', '--json'])
    const res = await executeContract(['deploy', WALLET_NAME, '--password', 'test', contractFile, callData, '--json'])
    const { result: { contractId }, transaction, descPath } = res
    deployDescriptor = descPath
    const [name, pref, add] = deployDescriptor.split('.')
    cAddress = contractId
    contractId.should.be.a('string')
    transaction.should.be.a('string')
    name.should.be.equal(contractFile)
    pref.should.be.equal('deploy')
    add.should.be.equal((await sdk.address()).split('_')[1])
  })

  it('Call Contract by descriptor', async () => {
    const callResponse = await executeContract(['call', WALLET_NAME, '--password', 'test', '--json', '--descrPath', deployDescriptor, 'test', '1', '2'])
    callResponse.result.returnValue.should.contain('cb_')
    callResponse.decodedResult.should.be.equal('3')
  })

  it('Call Contract static by descriptor', async () => {
    const callResponse = await executeContract(['call', WALLET_NAME, '--password', 'test', '--json', '--descrPath', deployDescriptor, 'test', '1', '2', '--callStatic'])
    callResponse.result.returnValue.should.contain('cb_')
    callResponse.decodedResult.should.equal('3')
  })

  it('Call Contract by contract address', async () => {
    const callResponse = await executeContract(['call', WALLET_NAME, '--password', 'test', '--json', '--contractAddress', cAddress, '--contractSource', contractFile, 'test', '1', '2'])
    callResponse.result.returnValue.should.contain('cb_')
    callResponse.decodedResult.should.equal('3')
  })

  it('Call Contract static by contract address', async () => {
    const callResponse = await executeContract(['call', WALLET_NAME, '--password', 'test', '--json', '--contractAddress', cAddress, '--contractSource', contractFile, 'test', '1', '2', '--callStatic'])
    callResponse.result.returnValue.should.contain('cb_')
    callResponse.decodedResult.should.equal('3')
  })
})
