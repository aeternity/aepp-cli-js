export default class CliError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CliError';
  }
}

export async function runProgram(program) {
  try {
    await program.parseAsync();
  } catch (error) {
    if (error instanceof CliError) program.error(error.message);
    throw error;
  }
}
