import aesjs from 'aes-js';
import { sha256 as Sha256 } from 'sha.js';

/**
 * Calculate SHA256 hash of `input`
 * @param {Uint8Array | string} input - Data to hash
 * @returns {Buffer} Hash
 */
function sha256hash(input) {
  return new Sha256().update(input).digest();
}

const Ecb = aesjs.ModeOfOperation.ecb;

/**
 * Encrypt given data using `password`
 * @param {string} password - Password to encrypt with
 * @param {Uint8Array} binaryData - Data to encrypt
 * @returns {Uint8Array} Encrypted data
 */
export function encryptKey(password, binaryData) {
  const hashedPasswordBytes = sha256hash(password);
  const aesEcb = new Ecb(hashedPasswordBytes);
  return aesEcb.encrypt(binaryData);
}

/**
 * Decrypt given data using `password`
 * @param {string} password - Password to decrypt with
 * @param {Uint8Array} encrypted - Data to decrypt
 * @returns {Uint8Array} Decrypted data
 */
export function decryptKey(password, encrypted) {
  const encryptedBytes = Buffer.from(encrypted);
  const hashedPasswordBytes = sha256hash(password);
  const aesEcb = new Ecb(hashedPasswordBytes);
  return aesEcb.decrypt(encryptedBytes);
}
