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

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { Universal, MemoryAccount, Node, Crypto } from '@aeternity/aepp-sdk'
import accountProgramFactory from '../src/commands/account'

chai.use(chaiAsPromised)
chai.should()

const url = process.env.TEST_URL || 'http://localhost:3013'
const compilerUrl = process.env.COMPILER_URL || 'http://localhost:3080'
const internalUrl = process.env.TEST_INTERNAL_URL || 'http://localhost:3113'
const publicKey = process.env.PUBLIC_KEY || 'ak_2dATVcZ9KJU5a8hdsVtTv21pYiGWiPbmVcU1Pz72FFqpk9pSRR'
const secretKey = process.env.SECRET_KEY || 'bf66e1c256931870908a649572ed0257876bb84e3cdf71efb12f56c7335fad54d5cf08400e988222f26eb4b02c8f89077457467211a6e6d955edb70749c6a33b'
export const networkId = process.env.TEST_NETWORK_ID || 'ae_devnet'
export const ignoreVersion = process.env.IGNORE_VERSION || false

const TIMEOUT = 18000000

export const KEY_PAIR = Crypto.generateKeyPair()
export const WALLET_NAME = 'mywallet'

export const genAccount = () => MemoryAccount({ keypair: Crypto.generateKeyPair() })

export const BaseAe = async (params = {}) => await Universal({
  ignoreVersion,
  compilerUrl,
  nodes: [{ name: 'test', instance: await Node({ url, internalUrl }) }],
  accounts: [MemoryAccount({ keypair: { publicKey, secretKey } })],
  ...params
})

export function configure (mocha) {
  mocha.timeout(TIMEOUT)
}

let planned = 0
let charged = false

export function plan (amount) {
  planned += amount
}

export async function ready (mocha) {
  configure(mocha)

  const ae = await BaseAe()
  await ae.awaitHeight(3)

  if (!charged && planned > 0) {
    console.log(`Charging new wallet ${KEY_PAIR.publicKey} with ${'100000000000000000000000'}`)
    await ae.spend('100000000000000000000000', KEY_PAIR.publicKey).catch(async e => {
      console.log(e)
      console.log(await e.verifyTx())
    })
    charged = true
  }

  const client = await BaseAe({
    accounts: [MemoryAccount({ keypair: KEY_PAIR })]
  })
  await executeProgram(accountProgramFactory, ['save', WALLET_NAME, '--password', 'test', KEY_PAIR.secretKey, '--overwrite'])
  return client
}

export async function executeProgram (programFactory, args) {
  let result = ''
  const program = programFactory()
  program
    .configureOutput({ writeOut: (str) => { result += str } })
    .exitOverride()

  const log = console.log
  console.log = (...data) => {
    if (result) result += '\n'
    result += data.join(' ')
  }
  await program.parseAsync([
    ...args,
    '--url', url,
    '--internalUrl', internalUrl,
    ...args[0] === 'contract' ? ['--compilerUrl', compilerUrl] : []
  ], { from: 'user' })
  console.log = log

  if (!args.includes('--json')) return result
  try {
    return JSON.parse(result)
  } catch (error) {
    throw new Error(`Can't parse as JSON:\n${result}`)
  }
}

export function parseBlock (res) {
  return res
    .split('\n')
    .reduce((acc, val) => {
      let v = val.split(/__/)
      if (v.length < 2) { v = val.split(':') }
      return Object.assign(acc, {
        [v[0].replace(' ', '_').replace(' ', '_').replace(' ', '_').toLowerCase()]:
          v[v.length - 1].split(/_ /).pop().trim()
      })
    }, {})
}

export function randomString (len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length)
    randomString += charSet.substring(randomPoz, randomPoz + 1)
  }
  return randomString
}
