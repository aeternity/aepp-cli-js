import { Argument } from 'commander';

// eslint-disable-next-line import/prefer-default-export
export const nonceArgument = new Argument('<nonce>', 'Unique number that is required to sign transaction securely')
  .argParser((nonce) => parseInt(nonce))
  .default(NaN);
