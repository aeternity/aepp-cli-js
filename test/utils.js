import { decode } from '@aeternity/aepp-sdk';
import { expect } from 'chai';

export function randomName(length = 18) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const random = new Array(length)
    .fill()
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
  return `${random}.chain`;
}

export function expectToMatchLines(value, testLines) {
  try {
    const valueLines = value.split('\n');
    testLines.forEach((test) => {
      if (typeof test === 'string') return expect(valueLines.shift()).to.be.equal(test);
      if (test instanceof RegExp) return expect(valueLines.shift()).to.be.match(test);
      throw new Error(`Unexpected test line: ${test}`);
    });
    expect(valueLines.join('\n')).to.be.equal('');
  } catch (error) {
    const stackItems = error.stack.split('\n');
    stackItems.splice(1, 3);
    error.stack = stackItems.join('\n');
    error.message += `\nWhole value:\n${value}`;
    throw error;
  }
}

export function toBeEncoded(value, encoding) {
  decode(value, encoding);
  return value;
}

export function toBeAbove0(value) {
  expect(value).to.be.a('number');
  expect(value).to.be.above(0);
  return value;
}

export function toMatch(value, template) {
  expect(value).to.be.a('string');
  expect(value).to.match(template);
  return value;
}
