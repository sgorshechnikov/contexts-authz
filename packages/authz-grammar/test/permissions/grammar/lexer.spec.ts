import {tokenize} from "../../../src/permissions/grammar/lexer";
import {getAuthZDefs} from "./test-helpers";

describe('permissions lexer', () => {
  test('tokenizes permission model correctly', () => {
    const input = getAuthZDefs('test-permissions.authz')
    expect(() => tokenize(input)).not.toThrow()
  });

  test('errors out encountering unknown tokens', () => {
    const input = `###`
    expect(() => tokenize(input)).toThrow()
  });
});