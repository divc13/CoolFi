import { base_decode } from 'near-api-js/lib/utils/serialize.js';
import pkg from 'elliptic';
const { ec: EC } = pkg;
import pkg2 from 'js-sha3';
const { sha3_256 } = pkg2;
import hash from 'hash.js';
import bs58check from 'bs58check';
const MPC_KEY = 'secp256k1:3tFRbMqmoa6AAALMrEFAYCEoHcqKxeW38YptwowBVBtXK1vo36HDbUWuR6EZmoK4JcH6HDkNMGGqP1ouV7VZUWya';

// Zcash t1 address prefix (mainnet P2PKH)
const ZCASH_MAINNET_P2PKH_PREFIX = 0x1CB8; // t1...

export function najPublicKeyStrToCompressedPoint(najPublicKeyStr) {
  const ec = new EC('secp256k1');
  
  // Decode the key from base58, then convert to a hex string
  const decodedKey = base_decode(najPublicKeyStr.split(':')[1]);
  
  // Check if the key is already in uncompressed format
  if (decodedKey.length === 64) {
    // If it's a raw 64-byte key, we must assume it's uncompressed and manually prepend '04' (uncompressed prefix)
    const uncompressedKey = '04' + Buffer.from(decodedKey).toString('hex');
    
    // Create a key pair from the uncompressed key
    const keyPoint = ec.keyFromPublic(uncompressedKey, 'hex').getPublic();
    
    // Return the compressed public key as a hex string
    return keyPoint.encodeCompressed('hex');
  } else {
    throw new Error('Unexpected key length. Expected uncompressed key format.');
  }
}

export async function deriveChildPublicKey(
  parentCompressedPublicKeyHex,
  signerId,
  path = ''
) {
  const ec = new EC('secp256k1');
  const scalarHex = sha3_256(
    `near-mpc-recovery v0.1.0 epsilon derivation:${signerId},${path}`
  );

  // Decode compressed public key
  const keyPoint = ec.keyFromPublic(parentCompressedPublicKeyHex, 'hex').getPublic();

  // Multiply the scalar by the generator point G
  const scalarTimesG = ec.g.mul(scalarHex);

  // Add the result to the old public key point
  const newPublicKeyPoint = keyPoint.add(scalarTimesG);

  // Return the new compressed public key
  return newPublicKeyPoint.encodeCompressed('hex');
}

export function convertPublicKeyToRipemd160Hash(publicKeyHex) {
  // Step 1: SHA-256 hashing of the public key
  const sha256Hash = hash.sha256().update(Buffer.from(publicKeyHex, 'hex')).digest();
  
  // Step 2: RIPEMD-160 hashing on the result of SHA-256
  return hash.ripemd160().update(Buffer.from(sha256Hash)).digest();
}

export function encodeZcashT1Address(pubKeyHash) {
  // Convert t1 version prefix to a 2-byte buffer (big-endian)
  const versionBuffer = Buffer.alloc(2);
  versionBuffer.writeUInt16BE(ZCASH_MAINNET_P2PKH_PREFIX, 0);
  
  // Concatenate version bytes and public key hash
  const payload = Buffer.concat([versionBuffer, Buffer.from(pubKeyHash)]);
  
  // Base58Check encode
  return bs58check.encode(payload);
}

export async function generateZcashT1Address(accountId, path = '') {
  // Derive child public key from parent
  const childPublicKeyHex = await deriveChildPublicKey(
    najPublicKeyStrToCompressedPoint(MPC_KEY),
    accountId,
    path
  );
  
  // Get RIPEMD-160 hash of the public key
  const pubKeyHash = convertPublicKeyToRipemd160Hash(childPublicKeyHex);
  
  // Encode the address as a t1 address
  const address = encodeZcashT1Address(pubKeyHash);
  
  return {
    address,
    publicKey: childPublicKeyHex
  };
}