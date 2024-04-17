#!/usr/bin/env npx tsx

import fs from 'fs-extra';
import { wallet } from './utils.ts';

async function rollbackToFirstBlock() {
  const { status } = await fetch('http://localhost:3313/rollback?height=1');
  if (status !== 200) throw new Error(`Unexpected status code: ${status}`);
}
await rollbackToFirstBlock();

await import('./reference.ts');
console.log('Reference generated');
await import('./readme.ts');
console.log('Readme updated');
await import('./user-guide.ts');
console.log('User guide updated');

await fs.remove(wallet);

export {};
