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
    if (
      error instanceof CliError
      || error.code === 'ENOENT'
    ) {
      program.error(error.message);
      return;
    }
    throw error;
  }
}
