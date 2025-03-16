import { generateZcashT1Address } from './src/app/services/kdf/zec.mjs';
const result = await generateZcashT1Address('your-near-account.near');
console.log(result.address);