import {buildAst} from "../../../src/permissions/grammar/visitor";
import {ModelType} from "../../../src/permissions/grammar/models";
import {getAuthZDefs} from "./test-helpers";

describe('AST builder', () => {
  test('builds correct AST for full permissions model', () => {
    const input = getAuthZDefs('test-permissions.authz')
    expect(() => buildAst(input)).not.toThrow()
  });

  test('errors out on wrong input', () => {
    const input = 'Hello world'
    expect(() => buildAst(input)).toThrow()
  });

  test('parses empty definitions', () => {
    const input = `
      definition user {}
      definition group {}
    `
    const ast = buildAst(input)
    expect(ast.definitions).toEqual([
      {type: ModelType.Definition, name: 'user', relations: [], permissions: []},
      {type: ModelType.Definition, name: 'group', relations: [], permissions: []},
    ])
  });

  test('parses empty definitions', () => {
    const input = `
      definition user {}
      definition group {}
    `
    const ast = buildAst(input)
    expect(ast.definitions).toEqual([
      {type: ModelType.Definition, name: 'user', relations: [], permissions: []},
      {type: ModelType.Definition, name: 'group', relations: [], permissions: []},
    ])
  });

  test('parses simple relations and permissions', () => {
    const input = `
      definition user {}
      
      definition group {
        relation member: user
        
        permission view = member
      }
    `
    const ast = buildAst(input)
    expect(ast.definitions).toEqual([
      {type: ModelType.Definition, name: 'user', relations: [], permissions: []},
      {
        type: ModelType.Definition,
        name: 'group',
        relations: [{
          type: ModelType.Relation,
          name: 'member',
          relationExpression: [{
            type: ModelType.RelationExpression,
            lhs: {type: ModelType.TypeReference, name: 'user'},
          }]
        }],
        permissions: [{
          type: ModelType.Permission,
          name: 'view',
          permissionExpression: [{
            type: ModelType.PermissionExpression,
            lhs: {type: ModelType.RelationReference, name: 'member'},
          }]
        }]
      },
    ])
  });

  test('parses referenced relations and permissions', () => {
    const input = `
      definition user {}
      
      definition org {
        relation admin: user
        
        permission manage = admin
      }
      
      definition group {
        relation member: user | org
        
        permission view = member + member.manage
      }
    `
    const ast = buildAst(input)
    expect(ast.definitions).toEqual([
      {type: ModelType.Definition, name: 'user', relations: [], permissions: []},
      {
        type: ModelType.Definition,
        name: 'org',
        relations: [{
          type: ModelType.Relation,
          name: 'admin',
          relationExpression: [{
            type: ModelType.RelationExpression,
            lhs: {type: ModelType.TypeReference, name: 'user'},
          }]
        }],
        permissions: [{
          type: ModelType.Permission,
          name: 'manage',
          permissionExpression: [{
            type: ModelType.PermissionExpression,
            lhs: {type: ModelType.RelationReference, name: 'admin'},
          }]
        }]
      },
      {
        type: ModelType.Definition,
        name: 'group',
        relations: [{
          type: ModelType.Relation,
          name: 'member',
          relationExpression: [{
            type: ModelType.RelationExpression,
            lhs: {type: ModelType.TypeReference, name: 'user'},
            relationalOperator: '|',
            rhs: {
              type: ModelType.RelationExpression,
              lhs: {type: ModelType.TypeReference, name: 'org'},
            },
          }]
        }],
        permissions: [{
          type: ModelType.Permission,
          name: 'view',
          permissionExpression: [{
            type: ModelType.PermissionExpression,
            lhs: {type: ModelType.RelationReference, name: 'member'},
            relationalOperator: '+',
            rhs: {
              type: ModelType.PermissionExpression,
              lhs: {type: ModelType.RelationReference, name: 'member', childPermission: 'manage'},
            }
          }]
        }]
      },
    ])
  });

  test('parses referenced nested relations and permissions', () => {
    const input = `
      definition user {}
      
      definition org {
        relation admin: user
        
        permission manage = admin
      }
      
      definition workspace {
        relation owner: org
      }
      
      definition group {
        relation owner: workspace
        
        permission view = owner->owner.manage
      }
    `
    const ast = buildAst(input)
    expect(ast.definitions).toEqual([
      {
        type: ModelType.Definition,
        name: "user",
        relations: [],
        permissions: []
      },
      {
        type: ModelType.Definition,
        name: "org",
        "relations": [
          {
            "type": ModelType.Relation,
            name: "admin",
            relationExpression: [
              {
                type: ModelType.RelationExpression,
                lhs: {
                  type: ModelType.TypeReference,
                  name: "user"
                }
              }
            ]
          }
        ],
        permissions: [
          {
            type: ModelType.Permission,
            name: "manage",
            permissionExpression: [
              {
                type: ModelType.PermissionExpression,
                lhs: {
                  type: ModelType.RelationReference,
                  name: "admin"
                }
              }
            ]
          }
        ]
      },
      {
        type: ModelType.Definition,
        name: "workspace",
        relations: [
          {
            type: ModelType.Relation,
            name: "owner",
            relationExpression: [
              {
                type: ModelType.RelationExpression,
                lhs: {
                  type: ModelType.TypeReference,
                  name: "org"
                }
              }
            ]
          }
        ],
        permissions: []
      },
      {
        type: ModelType.Definition,
        name: "group",
        relations: [
          {
            type: ModelType.Relation,
            name: "owner",
            relationExpression: [
              {
                type: ModelType.RelationExpression,
                lhs: {
                  type: ModelType.TypeReference,
                  name: "workspace"
                }
              }
            ]
          }
        ],
        permissions: [
          {
            type: ModelType.Permission,
            name: "view",
            permissionExpression: [
              {
                type: ModelType.PermissionExpression,
                lhs: {
                  type: ModelType.RelationReference,
                  name: "owner",
                  nestedRelationName: [
                    "owner"
                  ],
                  childPermission: "manage"
                }
              }
            ]
          }
        ]
      }
    ])
  });
});