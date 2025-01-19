import _executeProgram from '../execute-program.js';

export async function executeProgram(...args: Array<string | number>): Promise<string> {
  let out = await _executeProgram(...args);
  if (!args.includes('--url')) {
    // TODO: remove after resolving https://github.com/aeternity/aeplugin_dev_mode/issues/35
    out = out.replace(/mh_\w+/, 'mh_dnoULQWpiRtcrntd5yJPUxcu7YrTu18xZ1e9EC2b8prKdShME');
  }
  return out.trimEnd();
}

export function replaceInTemplate(template: string, placeholder: string, content: string): string {
  const begin = `<!-- ${placeholder}-BEGIN -->`;
  const end = `<!-- ${placeholder}-END -->`;
  return template.replace(new RegExp(`${begin}.*${end}`, 's'), [begin, content, end].join('\n'));
}

export const wallet = './wallet.json';

export const pass = ['--password', 'temp'] as const;
