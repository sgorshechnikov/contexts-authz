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
      import {ObjectDefinition} from '@contexts-authz/authz-model';
      
      export enum AuthzDefinitions {
        User = "user",
      }
      
      export class User implements ObjectDefinition {
        constructor(readonly id: string) {}
        __typename = "user";
      }
    `

    expect(code).toBeEqualIgnoringWhitespaces(expected)
  })



  test('generates types with permissions and relations', () => {
    const input = `
      definition user {}
      
      definition group {
        relation owner: user
        relation guest: user
        
        permission view = owner + guest
      }
    `
    const ast = buildAst(input)
    const codeGenerator = new AuthZTypesGenerator(ast)
    const code = codeGenerator.generate()
    const expected = `
      import {ObjectDefinition} from '@contexts-authz/authz-model';
      
      export enum AuthzDefinitions {
        User = "user",
        Group = "group",
      }
      
      export class User implements ObjectDefinition {
        constructor(readonly id: string) {}
        __typename = "user";
      }
      
      export class Group implements ObjectDefinition<Group.Permission, Group.Relation> {
        constructor(readonly id: string) {}
        __typename = "group";
      }
      
      export namespace Group {
        export enum Permission {
            View = "view",
        }
        
        export enum Relation {
            Owner = "owner",
            Guest = "guest",
        }
        
        export function hasPermission(relation: Relation, permission: Permission): boolean {
            switch (permission) {
                case Permission.View:
                    return [Relation.Owner, Relation.Guest].includes(relation);
                default:
                    return false;
            }
        }
      }
    `

    expect(code).toBeEqualIgnoringWhitespaces(expected)
  })

  test('generates types with permissions and no relations', () => {
    const input = `
      definition user {}
      
      definition group {
        permission view = user
      }
    `
    const ast = buildAst(input)
    const codeGenerator = new AuthZTypesGenerator(ast)
    const code = codeGenerator.generate()
    const expected = `
      import {ObjectDefinition} from '@contexts-authz/authz-model';
      
      export enum AuthzDefinitions {
        User = "user",
        Group = "group",
      }
      
      export class User implements ObjectDefinition {
        constructor(readonly id: string) {}
        __typename = "user";
      }
      
      export class Group implements ObjectDefinition<Group.Permission, void> {
        constructor(readonly id: string) {}
        __typename = "group";
      }
            
      export namespace Group {
        export enum Permission {
            View = "view",
        }
      }
    `

    expect(code).toBeEqualIgnoringWhitespaces(expected)
  })

  test('generates types with relations and no permissions', () => {
    const input = `
      definition user {}
      
      definition group {
        relation owner: user
      }
    `
    const ast = buildAst(input)
    const codeGenerator = new AuthZTypesGenerator(ast)
    const code = codeGenerator.generate()
    const expected = `
      import {ObjectDefinition} from '@contexts-authz/authz-model';
      
      export enum AuthzDefinitions {
        User = "user",
        Group = "group",
      }
      
      export class User implements ObjectDefinition {
        constructor(readonly id: string) {}
        __typename = "user";
      }

      export class Group implements ObjectDefinition<void, Group.Relation> {
        constructor(readonly id: string) {}
        __typename = "group";
      }
      
      export namespace Group {
        export enum Relation {
          Owner = "owner",
        }
      }
    `

    expect(code).toBeEqualIgnoringWhitespaces(expected)
  })
})