import {
  applicableRelations,
  permissionsForRelation,
  possiblePermissionsForPrincipal,
  requireTypeDefinition
} from "../src/util";
import {buildAst} from "@contexts-authz/authz-grammar";
import {getAuthZDefs} from "./test-helpers";

const testModel = getAuthZDefs('test-permissions.authz')

describe('applicableRelations', () => {
  test('should correctly filter applicable relations for entity', () => {
    const typeDefinitions = buildAst(testModel).definitions
    const typeDefinition = requireTypeDefinition('workspace', typeDefinitions)

    expect(applicableRelations('user', typeDefinition)).toEqual(['administrator', 'member', 'guest'])
    expect(applicableRelations('org', typeDefinition)).toEqual(['owner'])
  })

  test('should return empty result when there is no applicable relations', () => {
    const typeDefinitions = buildAst(testModel).definitions
    const typeDefinition = requireTypeDefinition('workspace', typeDefinitions)

    const applicable = applicableRelations('document', typeDefinition)
    expect(applicable).toEqual([])
  })

  test('should take relationship union types into account', () => {
    const typeDefinitions = buildAst(testModel).definitions
    const typeDefinition = requireTypeDefinition('document', typeDefinitions)

    expect(applicableRelations('user', typeDefinition)).toEqual(['owner', 'member', 'guest'])
    expect(applicableRelations('workspace', typeDefinition)).toEqual(['owner'])
  })
})

describe('permissionsForRelation', () => {
  test('should correctly filter permissions for relation', () => {
    const typeDefinitions = buildAst(testModel).definitions
    const typeDefinition = requireTypeDefinition('workspace', typeDefinitions)

    expect(permissionsForRelation('administrator', typeDefinition)).toEqual(['administer', 'edit', 'view'])
    expect(permissionsForRelation('member', typeDefinition)).toEqual(['edit', 'view'])
    expect(permissionsForRelation('guest', typeDefinition)).toEqual(['view'])
  })

  test('should return empty result when there is no applicable permissions', () => {
    const typeDefinitions = buildAst(testModel).definitions
    const typeDefinition = requireTypeDefinition('workspace', typeDefinitions)

    const permissions = permissionsForRelation('unknown', typeDefinition)
    expect(permissions).toEqual([])
  })
})

describe('requireTypeDefinition', () => {
  test('should return type definition for given type name', () => {
    const typeDefinitions = buildAst(testModel).definitions
    const typeDefinition = requireTypeDefinition('workspace', typeDefinitions)

    expect(typeDefinition.name).toEqual('workspace')
  })

  test('should throw error when type definition is not found', () => {
    const typeDefinitions = buildAst(testModel).definitions

    expect(() => requireTypeDefinition('unknown', typeDefinitions)).toThrow()
  })
})

describe('possiblePermissionsForPrincipal', () => {
  test('should return possible permissions for principal', () => {
    const typeDefinitions = buildAst(testModel).definitions

    expect(possiblePermissionsForPrincipal('user', 'workspace', typeDefinitions)).toEqual([{
      name: 'administer',
      type: 'direct'
    }, {
      name: 'administer',
      type: 'transitive',
      transitiveRelation: {
        relationName: 'owner',
        targetType: 'org',
        targetPermission: 'administer',
      }
    }, {
      name: 'edit',
      type: 'direct'
    }, {
      name: 'edit',
      type: 'transitive',
      transitiveRelation: {
        targetType: 'org',
        relationName: 'owner',
        targetPermission: 'administer',
      }
    }, {
      name: 'view',
      type: 'direct'
    }, {
      name: 'view',
      type: 'transitive',
      transitiveRelation: {
        targetType: 'org',
        relationName: 'owner',
        targetPermission: 'administer',
      }
    }])
  })

  test('should return possible permissions for principal with depth of 2', () => {
    const typeDefinitions = buildAst(testModel).definitions

    expect(possiblePermissionsForPrincipal('user', 'org', typeDefinitions)).toEqual([{
      name: 'administer',
      type: 'direct'
    }])
  })

  test('should return possible permissions for principal with depth of 3', () => {
    const typeDefinitions = buildAst(testModel).definitions

    expect(possiblePermissionsForPrincipal('user', 'document', typeDefinitions)).toEqual([{
      name: 'administer',
      type: 'transitive',
      transitiveRelation: {
        targetType: 'workspace',
        relationName: 'owner',
        targetPermission: 'administer',
      }
    }, {
      name: 'delete',
      type: 'direct'
    }, {
      name: 'delete',
      type: 'transitive',
      transitiveRelation: {
        targetType: 'workspace',
        relationName: 'owner',
        targetPermission: 'administer',
      }
    }, {
      name: 'edit',
      type: 'direct'
    }, {
      name: 'edit',
      type: 'transitive',
      transitiveRelation: {
        targetType: 'workspace',
        relationName: 'owner',
        targetPermission: 'administer',
      }
    }, {
      name: 'view',
      type: 'direct'
    }, {
      name: 'view',
      type: 'transitive',
      transitiveRelation: {
        targetType: 'workspace',
        relationName: 'owner',
        targetPermission: 'administer',
      }
    }])
  })

  test('should return empty result when there is no applicable permissions', () => {
    const typeDefinitions = buildAst(testModel).definitions

    expect(possiblePermissionsForPrincipal('org', 'workspace', typeDefinitions)).toEqual([])
  })
})