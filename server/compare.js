import { bls12_381 as bls } from '@noble/curves/bls12-381';
import { Buffer } from 'buffer';

const G1 = bls.G1.ProjectivePoint;
const G2 = bls.G2.ProjectivePoint;
const { Fp12 } = bls.fields;

export function compare(c1, c2) {
  const U1 = G1.fromHex(Buffer.from(c1.U, 'base64'));
  const V1 = G2.fromHex(Buffer.from(c1.V, 'base64'));
  const U2 = G1.fromHex(Buffer.from(c2.U, 'base64'));
  const V2 = G2.fromHex(Buffer.from(c2.V, 'base64'));

  const pairing1 = bls.pairing(U1, V2);
  const pairing2 = bls.pairing(U2, V1);

  return Fp12.eql(pairing1, pairing2);
}


/*import { bls12_381 as bls } from '@noble/curves/bls12-381';
import { Buffer } from 'buffer';

const G1 = bls.G1.ProjectivePoint;

export function compare(c1, c2) {
  const U1 = G1.fromHex(Buffer.from(c1.U, 'base64'));
  const V1 = G1.fromHex(Buffer.from(c1.V, 'base64'));
  const U2 = G1.fromHex(Buffer.from(c2.U, 'base64'));
  const V2 = G1.fromHex(Buffer.from(c2.V, 'base64'));

  // 使用 noble 的 pairing 函式（e: G1 × G1 → GT）
  const e1 = bls.pairing(U1, V2); // e(U₁, V₂)
  const e2 = bls.pairing(U2, V1); // e(U₂, V₁)

  return e1.equals(e2); // 若等於則代表相同明文
}
*/
