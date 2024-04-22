export default class CliError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CliError';
  }
}
