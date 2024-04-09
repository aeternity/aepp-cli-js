export const noValue = Symbol('replace with undefined');

export function prepareOptions(program) {
  Object.entries(program.opts())
    .filter(([, value]) => value === noValue)
    .forEach(([name]) => program.setOptionValue(name, undefined));

  program.commands.forEach(prepareOptions);
}
