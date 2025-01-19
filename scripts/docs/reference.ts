import { Command } from 'commander';
import fs from 'fs-extra';
import program from '../../src/commands/main.js';
import { commandExamples } from '../../src/utils/helpers.js';
import { replaceInTemplate } from './utils.js';

function buildToc(isReadme: boolean): string {
  const anchorCounter = {};

  const getAnchor = (name) => {
    anchorCounter[name] ??= -1;
    anchorCounter[name] += 1;
    return `${name}${anchorCounter[name] === 0 ? '' : `-${anchorCounter[name]}`}`;
  };

  function rec(cmd: Command, nesting: number): string {
    const name = cmd.name();
    if (cmd.commands.length) {
      getAnchor(name);
      return [
        `${' '.repeat(nesting)}- \`${name}\``,
        ...cmd.commands.map((c) => rec(c, nesting + 2)),
      ].join('\n');
    }
    return [
      [
        ' '.repeat(nesting),
        `- [\`${name}\`](${isReadme ? './reference.md' : ''}#${getAnchor(name)}) — `,
        cmd.summary(),
      ].join(''),
      ...cmd.commands.map((c) => rec(c, nesting + 2)),
    ].join('\n');
  }

  return program.commands.map((c) => rec(c, 0)).join('\n');
}

function asParagraph(summary: string) {
  if (!summary) return '';
  return `${summary[0].toUpperCase()}${summary.slice(1)}${summary.endsWith('.') ? '' : '.'}`;
}

function buildReference(command: Command): string {
  if (command.commands.length) {
    return ['', `# ${command.name()} group`, ...command.commands.map(buildReference)].join('\n');
  }

  const escapeUnderscores = (text: string) => text.replaceAll('_', '\\_');

  const help = command.createHelp();
  const fullName = help.commandUsage(command).replace(' ' + command.usage(), '');
  const examples = commandExamples.get(command);
  return [
    `\n## ${command.name()}\n`,
    `\`\`\`\n${help.commandUsage(command)}\n\`\`\``,
    `\n${escapeUnderscores(command.description())}`,

    ...(command.registeredArguments.some((argument) => help.argumentDescription(argument))
      ? [
          '\n#### Arguments\n',
          command.registeredArguments
            .map((argument) => [
              `\`${help.argumentTerm(argument)}\``,
              asParagraph(help.argumentDescription(argument)),
            ])
            .flat(1)
            .filter((line) => line)
            .join('  \n'),
        ]
      : []),

    ...(command.options.length
      ? [
          '\n#### Options\n',
          command.options
            .map((option) => [
              `\`${help.optionTerm(option)}\``,
              asParagraph(help.optionDescription(option)),
            ])
            .flat(1)
            .filter((line) => line)
            .join('  \n'),
        ]
      : []),

    ...(examples
      ? [
          `\n#### Example calls\n`,
          '```',
          ...examples.map((example) => `$ ${fullName}${example ? ` ${example}` : ''}`),
          '```',
        ]
      : []),

    ...command.commands.map(buildReference),
  ].join('\n');
}

await Promise.all([
  fs.writeFile(
    './reference.md',
    ['# AECLI commands', '', buildToc(false), ...program.commands.map(buildReference), ''].join(
      '\n',
    ),
  ),
  (async () => {
    let readme = await fs.readFile('./README.md', 'utf-8');
    readme = replaceInTemplate(readme, 'REFERENCE-TOC', buildToc(true));
    await fs.writeFile('./README.md', readme);
  })(),
]);
