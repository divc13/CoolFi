import { generateZcashT1Address } from './src/app/services/kdf/zec.mjs';
const result = await generateZcashT1Address('law1912.near');
console.log(result.address);