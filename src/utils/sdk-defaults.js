import { buildTx, unpackTx, Tag, MemoryAccount } from '@aeternity/aepp-sdk';

const accountId = MemoryAccount.generate().address;
const nonce = 1;

const nameUpdateDefaults = unpackTx(
  buildTx({
    tag: Tag.NameUpdateTx,
    accountId,
    nonce,
    nameId: 'test.chain',
    pointers: [],
  }),
  Tag.NameUpdateTx,
);

export const nameTtl = nameUpdateDefaults.nameTtl;

export const nameClientTtl = nameUpdateDefaults.clientTtl;
