import { AeSdk as AeSdkOrig } from '@aeternity/aepp-sdk/dist/aepp-sdk';

export * from '@aeternity/aepp-sdk/dist/aepp-sdk';

export const dump = (name, password, secretKey) => Promise.resolve({
  description: 'Lightweight and unencrypted version of keystore file specially for end to end tests of cli',
  name,
  password,
  secretKey: Buffer.from(secretKey).toString('hex'),
});

export const recover = (password, keyFile) => {
  if (password !== keyFile.password) throw new Error('Invalid password');
  return Promise.resolve(keyFile.secretKey);
};

const e2eConfig = {
  _expectedMineRate: 1000,
  _microBlockCycle: 300,
};

export class AeSdk extends AeSdkOrig {
  constructor(options) {
    super({ ...options, ...e2eConfig });
  }
}
