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
// # Utils `constant` Module
// That script contains default configuration for `CLI`

export {
  // ## AENS
  NAME_TTL,
  NAME_FEE,
  CLIENT_TTL,
  AENS_NAME_DOMAINS,
  // ## TRANSACTION
  TX_TTL
} from '@aeternity/aepp-sdk/es/tx/builder/schema'

// ## HAST TYPES
export const HASH_TYPES = {
  transaction: 'th',
  rawTransaction: 'tx',
  contract: 'ct',
  block: 'kh',
  micro_block: 'mh',
  signature: 'sg',
  account: 'ak',
  oracle: 'ok',
  oracleQuery: 'oq',
  stateHash: 'bs'
}

// ## CONNECTION
export const NODE_URL = 'http://localhost:3013'
export const NODE_INTERNAL_URL = 'http://localhost:3113'
export const NODE_WEBSOCKET_URL = 'https://sdk-testnet.aepps.com'
export const COMPILER_URL = 'http://localhost:3080'

// ## CHAIN
export const PLAY_LIMIT = 10
export const PLAY_INTERVAL = 1000

// ## CONTRACT
export const GAS = 1600000 - 21000 // MAX GAS
export const DEPOSIT = 0
export const VM_VERSION = 5 // fate
export const ABI_VERSION = 3 // fate
export const COMPILER_BACKEND = 'fate'
export const ORACLE_VM_VERSION = 0
export const GAS_PRICE = 1000000000 // 1e9
export const AMOUNT = 0
export const WAIT_MINED = true // Wait until tx will be mined

// ## ORACLE
export const QUERY_FEE = 30000
export const BUILD_ORACLE_TTL = (ttl) => { return { type: 'delta', value: ttl } }
export const ORACLE_TTL = 500
export const QUERY_TTL = 10
export const RESPONSE_TTL = 10

// ## Default transaction build param's
export const DEFAULT_CONTRACT_PARAMS = { vmVersion: VM_VERSION, amount: AMOUNT, deposit: DEPOSIT, gasPrice: GAS_PRICE, abiVersion: ABI_VERSION }

// ## DEFAULT OUTPUT FORMAT
export const OUTPUT_JSON = false
