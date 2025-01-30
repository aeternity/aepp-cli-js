import fs from 'fs-extra';
import { executeProgram, replaceInTemplate, wallet, pass } from './utils.js';

Date.prototype.toString = function (): string {
  return this.toLocaleString('en-UK', { timeZone: 'Europe/Berlin' });
};

const contractSourceCode = 'contract Example =\n' + '  entrypoint sum(a: int, b: int) = a + b';
const contract = './contract.aes';
const contractDescriptor =
  'contract.aes.deploy.5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV.json';

async function getInspectExamples(): Promise<string> {
  const inspect = async (name, id) =>
    [
      `#### inspect ${name}`,
      '',
      '```',
      `$ aecli inspect ${id}`,
      await executeProgram('inspect', id, '--url', 'https://testnet.aeternity.io'),
      '```',
    ].join('\n');
  return [
    await inspect('account by address', 'ak_22xzfNRfgYWJmsB1nFAGF3kmabuaGFTzWRobNdpturBgHF83Cx'),
    await inspect('transaction', 'th_iirV7mw49NfFY8NbBhbXGBLv9PPT3h1ou11oKtPsJVHGVpWVC'),
    await inspect('block', 'mh_2DhgyD4np6n3JMsNWVXdtWZE2rAx74sgxL6nb2GsCKB1VnbLxN'),
  ].join('\n\n');
}

async function getContractDeployOutput(): Promise<string> {
  const args = ['contract', 'deploy', '--contractSource', contract, wallet];
  const output = await executeProgram(...args, ...pass);
  return [
    '```',
    `$ aecli ${args.join(' ')}`,
    output.replace(/([\w/-]+)contract\.aes\.deploy/, '/path/to/contract.aes.deploy'),
    '```',
  ].join('\n');
}

async function getContractCallOutput(): Promise<string> {
  const args = ['contract', 'call', '--descrPath', contractDescriptor, 'sum'];
  const output = await executeProgram(...args, '[1, 2]', wallet, ...pass);
  return ['```', `$ aecli ${args.join(' ')} '[1, 2]' ${wallet}`, output, '```'].join('\n');
}

let [guide] = await Promise.all([
  fs.readFile('./user-guide.md', 'utf-8'),
  fs.writeFile(contract, contractSourceCode),
]);
guide = replaceInTemplate(guide, 'INSPECT-EXAMPLES', await getInspectExamples());
guide = replaceInTemplate(guide, 'CONTRACT', `\`\`\`\n${contractSourceCode}\n\`\`\``);
guide = replaceInTemplate(guide, 'CONTRACT-DEPLOY', await getContractDeployOutput());
guide = replaceInTemplate(guide, 'CONTRACT-CALL', await getContractCallOutput());
await Promise.all([
  fs.remove(contract),
  fs.remove(contractDescriptor),
  fs.writeFile('./user-guide.md', guide),
]);
