import {expect} from '@jest/globals';
import {ExpectationResult} from "expect";
import MatcherUtils = jest.MatcherUtils;

function toBeEqualIgnoringWhitespaces(actual: string, expected: string): ExpectationResult {
  //@ts-expect-error - this is a jest matcher
  const matcherUtils = this as MatcherUtils
  const actualWithoutWhitespaces = actual.replace(/\s/g, '');
  const expectedWithoutWhitespaces = expected.replace(/\s/g, '');

  const pass = actualWithoutWhitespaces === expectedWithoutWhitespaces

  if (pass) {
    return {
      message: () =>
          `expected ${matcherUtils.utils.printReceived(
              actual,
          )} not to be equal to ${matcherUtils.utils.printReceived(
              expected,
          )}}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
          `expected ${matcherUtils.utils.printReceived(
              actual,
          )} to be equal ${matcherUtils.utils.printReceived(
              expected,
          )}`,
      pass: false,
    };
  }
}

declare global {
  namespace jest {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toBeEqualIgnoringWhitespaces(value: string): CustomMatcherResult;
    }
  }
}

expect.extend({
  toBeEqualIgnoringWhitespaces,
});