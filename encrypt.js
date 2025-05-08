import { bls12_381 as bls } from '@noble/curves/bls12-381';
import { blake2b } from '@noble/hashes/blake2b';
import { utf8ToBytes } from '@noble/hashes/utils';
import { Buffer } from 'buffer';

function bytesToNumberBE(bytes) {
  const hex = Buffer.from(bytes).toString('hex');
  return BigInt('0x' + hex);
}

const G1 = bls.G1.ProjectivePoint;
const G2 = bls.G2.ProjectivePoint;
const g = G1.BASE;

const sk = bls.utils.randomPrivateKey();
const skBigInt = bytesToNumberBE(sk);
const pk = g.multiply(skBigInt);

function hashToG2(keyword) {
  return bls.G2.hashToCurve(utf8ToBytes(keyword)).clearCofactor();
}

function hashMask(U, V, Y, length) {
  const seed = new Uint8Array([
    ...U.toRawBytes(true),
    ...V.toRawBytes(true),
    ...Y.toRawBytes(true),
  ]);

  const output = new Uint8Array(length);
  let counter = 0;
  let pos = 0;

  while (pos < length) {
    const blockInput = new Uint8Array(seed.length + 1);
    blockInput.set(seed, 0);
    blockInput[seed.length] = counter++;

    const block = blake2b(blockInput, { dkLen: 32 });
    const remaining = Math.min(block.length, length - pos);
    output.set(block.slice(0, remaining), pos);
    pos += remaining;
  }

  return output;
}

export function encrypt(keyword) {
  const m = hashToG2(keyword);
  const r = bls.utils.randomPrivateKey();
  const rBigInt = bytesToNumberBE(r);

  const U = g.multiply(rBigInt);       // G1
  const V = m.multiply(rBigInt);       // G2
  const Y = pk.multiply(rBigInt);      // G1（跟 G2 搭配）

  const mBytes = m.toRawBytes(true);
  const rBytes = r;
  const mrBytes = new Uint8Array(mBytes.length + rBytes.length);
  mrBytes.set(mBytes, 0);
  mrBytes.set(rBytes, mBytes.length);

  const mask = hashMask(U, V, Y, mrBytes.length);
  const W = mrBytes.map((b, i) => b ^ mask[i]);

  return {
    ciphertext: {
      U: Buffer.from(U.toRawBytes(true)).toString('base64'),
      V: Buffer.from(V.toRawBytes(true)).toString('base64'),
      W: Buffer.from(W).toString('base64')
    }
  };
}

export { sk, pk };