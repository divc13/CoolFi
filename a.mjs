import { generateZcashT1Address } from './src/app/services/kdf/zec.mjs';
const result = await generateZcashT1Address('dc1312.near', '');
console.log(result.address);
console.log(result.publicKey);