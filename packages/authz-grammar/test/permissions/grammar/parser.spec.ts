import {parse} from "../../../src/permissions/grammar/parser";
import {getAuthZDefs} from "./test-helpers";

describe('permissions parser', () => {
  test('successfully parses full permission model', () => {
    const input = getAuthZDefs('test-permissions.authz')
    expect(() => parse(input)).not.toThrow()
  });

  test('errors out on wrong input', () => {
    const input = 'Hello world'
    expect(() => parse(input)).toThrow()
  });
});