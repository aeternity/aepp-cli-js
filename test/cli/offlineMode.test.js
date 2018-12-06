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

import { describe, it } from 'mocha'

import { configure, BaseAe, execute, parseBlock, KEY_PAIR, WALLET_NAME, ready } from './index'
import { generateKeyPair } from '@aeternity/aepp-sdk/es/utils/crypto'

function randomName () {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36) + '.test'
}

async function signAndPost (tx, assert) {
  const signedRes = await execute(['account', 'sign', WALLET_NAME, tx, '--password', 'test'])
  const signed = parseBlock(signedRes)
  let signedTx = Object.entries(signed)[0][1]

  let res
  if (assert) {
    res = await execute(['tx', 'broadcast', signedTx])
    res.indexOf('Transaction send to the chain').should.be.equal(0)
  } else {
    res = await execute(['tx', 'broadcast', signedTx, '--waitMined'])
  }

  return res
}

describe.only('CLI Transaction Module', function () {
  configure(this)
  let wallet
  let salt
  let name = randomName()

  before(async function() {
    wallet = await ready(this)
  })

  it('Build spend tx offline and send the chain', async () => {
    const amount = 100
    const receiverKeys = generateKeyPair()
    const receiver = await BaseAe()
    receiver.setKeypair(receiverKeys)

    const { transaction_hash } = parseBlock(await execute(['tx', 'spend', KEY_PAIR.publicKey, KEY_PAIR.publicKey, amount]))
    await signAndPost(transaction_hash, true)
  })

  it.only('Build preclaim tx offline and send the chain', async () => {
    const { preclaim_tx, salt: _salt } = parseBlock(await execute(['tx', 'name-preclaim', KEY_PAIR.publicKey, name]))
    salt = _salt
    const res = (parseBlock(await signAndPost(preclaim_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it.only('Build claim tx offline and send the chain', async () => {
    const { claim_tx } = parseBlock(await execute(['tx', 'name-claim', KEY_PAIR.publicKey, salt, name]))
    const res = (parseBlock(await signAndPost(claim_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it.only('Build update tx offline and send the chain', async () => {
    const { update_tx } = parseBlock(await execute(['tx', 'name-update', KEY_PAIR.publicKey, name, KEY_PAIR.publicKey]))
    const res = (parseBlock(await signAndPost(update_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it.only('Build transfer tx offline and send the chain', async () => {
    const { transfer_tx } = parseBlock(await execute(['tx', 'name-transfer', KEY_PAIR.publicKey, KEY_PAIR.publicKey, name]))
    const res = (parseBlock(await signAndPost(transfer_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it.only('Build revoke tx offline and send the chain', async () => {
    const { revoke_tx } = parseBlock(await execute(['tx', 'name-revoke', KEY_PAIR.publicKey, name]))
    const res = (parseBlock(await signAndPost(revoke_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

})
