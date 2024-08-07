import {expect} from '@jest/globals';
import {ExpectationResult} from "expect";
import MatcherUtils = jest.MatcherUtils;
import {
  DynamoDBDocumentClientCommand
} from "@aws-sdk/lib-dynamodb/dist-types/baseCommand/DynamoDBDocumentClientCommand";
import _  from "lodash";

export function toBeMatchingDynamoCommand(
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    actual: DynamoDBDocumentClientCommand<any, any, any, any, any>,
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    expected: DynamoDBDocumentClientCommand<any, any, any, any, any>): ExpectationResult {
  //@ts-expect-error - this is a jest matcher
  const matcherUtils = this as MatcherUtils

  const pass =
    _.isEqual(actual.input, expected.input) && actual.constructor.name === expected.constructor.name

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

interface CustomMatchers<R = unknown> {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  toBeMatchingDynamoCommand(value: DynamoDBDocumentClientCommand<any, any, any, any, any>): R;
}

declare global {
  namespace jest {
    //eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Expect extends CustomMatchers {}
    //eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Matchers<R> extends CustomMatchers<R> {}
    //eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

expect.extend({
  toBeMatchingDynamoCommand,
});
