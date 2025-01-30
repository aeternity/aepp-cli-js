import nacl from 'tweetnacl';
import { v4 as uuid } from 'uuid';
import { hash, argon2id } from 'argon2';
import { MemoryAccount, encode, decode, Encoding } from '@aeternity/aepp-sdk';
import CliError from './CliError.js';

const CRYPTO_PARAMS = {
  secret_type: 'ed25519',
  symmetric_alg: 'xsalsa20-poly1305',
  kdf: 'argon2id',
  kdf_params: {
    memlimit_kib: 65536,
    opslimit: 3,
    parallelism: 4,
  },
};

/**
 * Derive encryption key from password with key derivation function.
 * @category keystore
 * @param password - User-supplied password.
 * @param salt - Randomly generated nonce.
 * @param kdfParams - KDF parameters.
 * @returns Encryption key derived from password.
 */
async function deriveKey(password, salt, { opslimit, memlimit_kib, ...options }) {
  return hash(password, {
    ...options,
    salt,
    timeCost: opslimit,
    memoryCost: memlimit_kib,
    type: argon2id,
    raw: true,
  });
}

/**
 * Recover plaintext private key from secret-storage key object.
 * @category keystore
 * @param password - Keystore object password.
 * @param keystore - Keystore object.
 * @returns sk_-encoded secret key.
 */
export async function recover(password, { crypto }) {
  if (crypto.symmetric_alg !== CRYPTO_PARAMS.symmetric_alg) {
    throw new CliError(`Unsupported keystore algorithm: ${crypto.symmetric_alg}`);
  }
  if (crypto.kdf !== CRYPTO_PARAMS.kdf) {
    throw new CliError(`Unsupported keystore algorithm: ${crypto.kdf}`);
  }

  const salt = Buffer.from(crypto.kdf_params.salt, 'hex');
  const key = await deriveKey(password, salt, crypto.kdf_params);

  const secretKeyRaw = nacl.secretbox.open(
    Buffer.from(crypto.ciphertext, 'hex'),
    Buffer.from(crypto.cipher_params.nonce, 'hex'),
    key,
  );
  if (secretKeyRaw == null) throw new CliError('Invalid keystore password');
  return encode(secretKeyRaw.subarray(0, 32), Encoding.AccountSecretKey);
}

/**
 * Export private key to keystore secret-storage format.
 * @category keystore
 * @param name - Key name.
 * @param password - User-supplied password.
 * @param secretKey - sk_-encoded secret key.
 */
export async function dump(name, password, secretKey) {
  const nonce = Buffer.from(nacl.randomBytes(24));

  const salt = Buffer.from(nacl.randomBytes(16));
  const key = await deriveKey(password, salt, CRYPTO_PARAMS.kdf_params);

  const { secretKey: secretKeyRaw } = nacl.sign.keyPair.fromSeed(decode(secretKey));

  return {
    name,
    version: 1,
    public_key: new MemoryAccount(secretKey).address,
    id: uuid(),
    crypto: {
      ...CRYPTO_PARAMS,
      ciphertext: Buffer.from(nacl.secretbox(secretKeyRaw, nonce, key)).toString('hex'),
      cipher_params: { nonce: nonce.toString('hex') },
      kdf_params: {
        ...CRYPTO_PARAMS.kdf_params,
        salt: salt.toString('hex'),
      },
    },
  };
}
