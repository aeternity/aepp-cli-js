import envPaths from 'env-paths';
import fs from 'fs-extra';
import path from 'path';

const configPath = path.resolve(envPaths('aecli').config, 'config.json');
const options = ['url', 'compilerUrl'];

async function readConfig() {
  try {
    return await fs.readJson(configPath);
  } catch {
    return {};
  }
}

export async function addToConfig(configPart) {
  await fs.outputJson(configPath, { ...await readConfig(), ...configPart });
}

const configPromise = readConfig();

export async function setCommandOptions(program) {
  const config = await configPromise;
  options
    .filter((option) => option in config)
    .forEach((option) => program.setOptionValueWithSource(option, config[option], 'config'));
  program.commands.forEach(setCommandOptions);
}
