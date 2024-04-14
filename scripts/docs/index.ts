#!/usr/bin/env npx tsx

async function rollbackToFirstBlock() {
  const { status } = await fetch('http://localhost:3313/rollback?height=1');
  if (status !== 200) throw new Error(`Unexpected status code: ${status}`);
}
await rollbackToFirstBlock();

await import('./reference.ts');
console.log('Reference generated');
await import('./readme.ts');
console.log('Readme updated');

export {};
