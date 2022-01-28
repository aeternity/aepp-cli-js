import {
  Universal as UniversalOrig, Transaction as TransactionOrig, ChainNode as ChainNodeOrig
} from '@aeternity/aepp-sdk/dist/aepp-sdk'

export * from '@aeternity/aepp-sdk/dist/aepp-sdk'

export const Keystore = {
  dump: (name, password, secretKey) => Promise.resolve({
    description: 'Lightweight and unencrypted version of keystore file specially for end to end tests of cli',
    name,
    password,
    secretKey: Buffer.from(secretKey).toString('hex')
  }),
  recover: (password, keyFile) => {
    if (password !== keyFile.password) throw new Error('Invalid password')
    return Promise.resolve(keyFile.secretKey)
  }
}

const configStamp = {
  deepProps: {
    Ae: {
      defaults: {
        _expectedMineRate: 1000,
        _microBlockCycle: 300
      }
    }
  }
}

export const Universal = UniversalOrig.compose(configStamp)

export const Transaction = TransactionOrig.compose(configStamp)

export const ChainNode = ChainNodeOrig.compose(configStamp)
