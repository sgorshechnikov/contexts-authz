import {buildAst} from "@contexts-authz/authz-grammar";
import {AuthZTypesGenerator} from "../../src/codegen/AuthZTypesGenerator";
import "./toBeEqualIgnoringWhitespaces";

describe('AuthZTypesGenerator', () => {
  test('generates right types for empty definitions', () => {
    const input = `
      definition user {}
    `
    const ast = buildAst(input)
    const codeGenerator = new AuthZTypesGenerator(ast)
    const code = codeGenerator.generate()
    const expected = `
      export interface ObjectDefinition<Permission = void> {
        id: string;
        __typename: string;
      }

      export class User implements ObjectDefinition {
        readonly id: string;
        constructor(id: string);
        __typename: "user";
      }
    `

    expect(code).toBeEqualIgnoringWhitespaces(expected)
  })

  test('generates namespaced types when configured', () => {
    const input = `
      definition user {}
    `
    const ast = buildAst(input)
    const codeGenerator = new AuthZTypesGenerator(ast, {namespace: 'AuthZ'})
    const code = codeGenerator.generate()
    const expected = `
      declare namespace AuthZ {
        interface ObjectDefinition<Permission = void> {
          id: string;
          __typename: string;
        }
  
        class User implements ObjectDefinition {
          readonly id: string;
          constructor(id: string);
          __typename: "user";
        }
      }
    `

    expect(code).toBeEqualIgnoringWhitespaces(expected)
  })

  test('generates types with permissions', () => {
    const input = `
      definition user {}
      
      definition group {
        relation owner: user
        permission view = user
      }
    `
    const ast = buildAst(input)
    const codeGenerator = new AuthZTypesGenerator(ast, {namespace: 'AuthZ'})
    const code = codeGenerator.generate()
    const expected = `
      declare namespace AuthZ {
        interface ObjectDefinition<Permission = void> {
          id: string;
          __typename: string;
        }
  
        class User implements ObjectDefinition {
          readonly id: string;
          constructor(id: string);
          __typename: "user";
        }
        
        namespace Group {
          const enum Permission {
              View = "view",
          }
        }
        
        class Group implements ObjectDefinition<Group.Permission> {
          readonly id: string;
          constructor(id: string);
          __typename: "group";
        }
      }
    `

    expect(code).toBeEqualIgnoringWhitespaces(expected)
  })
})