import {getAuthZDefs} from "./test-helpers";
import {AuthzDynamo} from "../src/AuthzDynamo";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {Org, User, Workspace, Document} from "./test-model";
import {BatchGetCommand, GetCommand, QueryCommand, TransactWriteCommand} from "@aws-sdk/lib-dynamodb"
import './toBeMatchingDynamoCommand';
import {ObjectsRelation} from "@contexts-authz/authz-model";

jest.mock('@aws-sdk/client-dynamodb')

const TEST_TABLE = 'test-table'
const testModel = getAuthZDefs('test-permissions.authz')
const authzDynamo = new AuthzDynamo(new DynamoDBClient(), {
  tableName: TEST_TABLE,
  authzDefinition: testModel,
})

beforeEach(() => {
  jest.resetAllMocks()
});

describe('addRelations', () => {
  test('should create right request to dynamo', async () => {
    const addedRelations = [{
      source: new User('user-id'),
      target: new Org('org-id'),
      relation: Org.Relation.Administrator,
    }]

    const expectedDynamoCommand = new TransactWriteCommand({
      TransactItems: addedRelations.map(relation => {
        return {
          Put: {
            TableName: TEST_TABLE,
            Item: {
              PK: `${relation.source.__typename}#${relation.source.id}`,
              SK: `${relation.target.__typename}#${relation.target.id}`,
              Relation: relation.relation as string,
            }
          }
        }
      })
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({}))
    await authzDynamo.addRelations(addedRelations)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should fail if there is no applicable relations', async () => {
    const addedRelations = [{
      source: new Org('org-id'),
      target: new Org('org-id'),
      relation: Org.Relation.Administrator,
    }]

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({}))
    await expect(authzDynamo.addRelations(addedRelations)).rejects.toThrow()
  })
})

describe('getPermissions', () => {
  test('should create right request to dynamo', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDynamoCommand = new GetCommand({
      TableName: TEST_TABLE,
      Key: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({}))
    await authzDynamo.getPermissions(principal, resource)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should return right permissions', async () => {
    const principal = new User('user-id')
    const workspace = new Workspace('workspace-id')
    const parentOrg = new Org('org-id')

    mockDbRelations([{
      source: parentOrg,
      target: workspace,
      relation: 'owner',
    }, {
      source: principal,
      target: workspace,
      relation: 'member',
    }])

    const result = await authzDynamo.getPermissions(principal, workspace)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(3)
    expect(result).toEqual([Workspace.Permission.Edit, Workspace.Permission.View])
  })

  test('should return right permissions transitively', async () => {
    const principal = new User('user-id')
    const workspace = new Workspace('workspace-id')
    const parentOrg = new Org('org-id')

    mockDbRelations([{
      source: parentOrg,
      target: workspace,
      relation: 'owner',
    }, {
      source: parentOrg,
      target: workspace,
      relation: 'some-relation',
    }, {
      source: principal,
      target: workspace,
      relation: 'member',
    }, {
      source: principal,
      target: parentOrg,
      relation: 'administrator',
    }])
    const result = await authzDynamo.getPermissions(principal, workspace)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(3)
    expect(result).toEqual([Workspace.Permission.Edit, Workspace.Permission.View, Workspace.Permission.Administer])
  })

  test('should return right permissions transitively with 2 layers', async () => {
    const principal = new User('user-id')
    const document = new Document('board-id')
    const parentWorkspace = new Workspace('workspace-id')
    const parentOrg = new Org('org-id')

    mockDbRelations([{
      source: parentWorkspace,
      target: document,
      relation: 'owner',
    }, {
      source: parentOrg,
      target: parentWorkspace,
      relation: 'owner',
    }, {
      source: principal,
      target: parentOrg,
      relation: 'administrator',
    }])
    const result = await authzDynamo.getPermissions(principal, document)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(5)
    expect(result).toEqual([Document.Permission.Administer, Document.Permission.Delete, Document.Permission.Edit, Document.Permission.View])
  })
})

describe('getRelation', () => {
  test('should create right request to dynamo', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDynamoCommand = new GetCommand({
      TableName: TEST_TABLE,
      Key: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Item: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
        Relation: 'administrator'
      }
    }))
    await authzDynamo.getRelation(principal, resource)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should return correct relation', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Item: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
        Relation: 'administrator'
      }
    }))
    const relation = await authzDynamo.getRelation(principal, resource)
    expect(relation).toEqual(Org.Relation.Administrator)
  })
})

describe('getRelations', () => {
  test('should create right request to dynamo', async () => {
    const first = 10
    const resource = new Org('org-id')
    const relationObject = new User('user-id')

    const expectedDynamoCommand = new QueryCommand({
      TableName: TEST_TABLE,
      IndexName: "RolesByResource",
      KeyConditionExpression: "SK = :sk",
      ExpressionAttributeValues: {
        ":sk": `${resource.__typename}#${resource.id}`,
      },
      Limit: first,
      ExclusiveStartKey: undefined,
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Items: [{
        PK: `${relationObject.__typename}#${relationObject.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }],
      LastEvaluatedKey: {
        PK: `${relationObject.__typename}#${relationObject.id}`,
        SK: `${resource.__typename}#${resource.id}`
      },
    }))
    await authzDynamo.getRelations(resource, first)

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should create right paginated request to dynamo', async () => {
    const first = 10
    const resource = new Org('org-id')
    const relationObject = new User('user-id')

    const expectedDynamoCommand = new QueryCommand({
      TableName: TEST_TABLE,
      IndexName: "RolesByResource",
      KeyConditionExpression: "SK = :sk",
      ExpressionAttributeValues: {
        ":sk": `${resource.__typename}#${resource.id}`,
      },
      Limit: first,
      ExclusiveStartKey: {
        SK: `${resource.__typename}#${resource.id}`,
        PK: `${relationObject.__typename}#${relationObject.id}`,
      },
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Items: [{
        PK: `${relationObject.__typename}#${relationObject.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }],
      LastEvaluatedKey: {
        PK: `${relationObject.__typename}#${relationObject.id}`,
        SK: `${resource.__typename}#${resource.id}`
      },
    }))
    await authzDynamo.getRelations(resource, first, undefined, btoa(`${relationObject.__typename}#${relationObject.id}`))

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should return the relations', async () => {
    const resource = new Org('org-id')
    const relationObject = new User('user-id')

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Items: [{
        PK: `${relationObject.__typename}#${relationObject.id}`,
        SK: `${resource.__typename}#${resource.id}`,
        Relation: 'member'
      }],
      LastEvaluatedKey: {
        PK: `${relationObject.__typename}#${relationObject.id}`,
        SK: `${resource.__typename}#${resource.id}`
      },
    }))
    const relations = await authzDynamo.getRelations(resource, 10)

    const expectedRelations = {
      resource: resource,
      cursor: btoa(`${relationObject.__typename}#${relationObject.id}`),
      relations: [{
        object: {
          id: relationObject.id,
          __typename: relationObject.__typename,
        },
        relation: 'member',
        cursor: btoa(`${relationObject.__typename}#${relationObject.id}`),
      }]
    }
    expect(relations).toEqual(expectedRelations)
  })
})

describe('getRelationsForPrincipal', () => {
  test('should create right request to dynamo', async () => {
    const first = 10
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDynamoCommand = new QueryCommand({
      TableName: TEST_TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `${principal.__typename}#${principal.id}`,
        ":sk": `${resource.__typename}#`,
      },
      Limit: first,
      ExclusiveStartKey: undefined,
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Items: [{
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }],
      LastEvaluatedKey: {PK: `${principal.__typename}#${principal.id}`, SK: `${resource.__typename}#${resource.id}`},
    }))
    await authzDynamo.getRelationsForPrincipal(principal, resource.__typename, first)

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should create right paginated request to dynamo', async () => {
    const first = 10
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDynamoCommand = new QueryCommand({
      TableName: TEST_TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `${principal.__typename}#${principal.id}`,
        ":sk": `${resource.__typename}#`,
      },
      Limit: first,
      ExclusiveStartKey: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      },
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Items: [{
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }],
      LastEvaluatedKey: {PK: `${principal.__typename}#${principal.id}`, SK: `${resource.__typename}#${resource.id}`},
    }))
    await authzDynamo.getRelationsForPrincipal(principal, resource.__typename, first, btoa(`${resource.__typename}#${resource.id}`))

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should return the permissions', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Items: [{
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
        Relation: 'member'
      }],
      LastEvaluatedKey: {PK: `${principal.__typename}#${principal.id}`, SK: `${resource.__typename}#${resource.id}`},
    }))
    const relations = await authzDynamo.getRelationsForPrincipal(principal, resource.__typename, 10, btoa(`${resource.__typename}#${resource.id}`))

    expect(relations).toEqual({
      resource: principal,
      cursor: btoa(`${resource.__typename}#${resource.id}`),
      relations: [{
        object: {
          id: resource.id,
          __typename: resource.__typename,
        },
        relation: 'member',
        cursor: btoa(`${resource.__typename}#${resource.id}`),
      }]
    })
  })
})

describe('getPrincipalRelationsForEntities', () => {
  test('should not make any requests if there are no resources', async () => {
    const principal = new User('user-id')

    const relations = await authzDynamo.getPrincipalRelationsForEntities(principal, [])
    expect(relations).toEqual([])
    expect(DynamoDBClient.prototype.send).not.toHaveBeenCalled()
  })

  test('should create right request to dynamo', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDynamoCommand = new BatchGetCommand({
      RequestItems: {
        [TEST_TABLE]: {
          Keys: [{
            PK: `${principal.__typename}#${principal.id}`,
            SK: `${resource.__typename}#${resource.id}`,
          }]
        }
      }
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Responses: {
        [TEST_TABLE]: [{
          PK: `${principal.__typename}#${principal.id}`,
          SK: `${resource.__typename}#${resource.id}`,
          Relation: 'member'
        }]
      }
    }))
    await authzDynamo.getPrincipalRelationsForEntities(principal, [resource])

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should return the relations', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Responses: {
        [TEST_TABLE]: [{
          PK: `${principal.__typename}#${principal.id}`,
          SK: `${resource.__typename}#${resource.id}`,
          Relation: 'member'
        }]
      }
    }))
    const relations = await authzDynamo.getPrincipalRelationsForEntities(principal, [resource])

    expect(relations).toEqual([{
      object: resource,
      relation: 'member',
    }])
  })
})

describe('getPrincipalPermissionsForEntities', () => {
  test('should not make any requests if there are no resources', async () => {
    const principal = new User('user-id')

    const permissions = await authzDynamo.getPrincipalPermissionsForEntities(principal, [], [], [])
    expect(permissions).toEqual([])
    expect(DynamoDBClient.prototype.send).not.toHaveBeenCalled()
  })

  test('should resolve direct permissions', async () => {
    const principal = new User('user-id')
    const document = new Document('document-id')
    const document1 = new Document('document-id-1')

    mockDbRelations([
      {source: principal, target: document, relation: 'guest'},
      {source: principal, target: document1, relation: 'owner'},
    ])

    const permissions = await authzDynamo.getPrincipalPermissionsForEntities(principal, [document, document1], [], [Document.Permission.View])

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(1)
    expect(permissions).toEqual([{
      resource: document,
      permissions: [Document.Permission.View]
    }, {
      resource: document1,
      permissions: [Document.Permission.View]
    }])
  })

  test('should resolve transitive permissions', async () => {
    const principal = new User('user-id')
    const document = new Document('document-id')
    const document1 = new Document('document-id-1')
    const workspace = new Workspace('workspace-id')

    mockDbRelations([
      {source: principal, target: workspace, relation: 'administrator'},
      {source: workspace, target: document, relation: 'owner'},
      {source: workspace, target: document1, relation: 'owner'},
    ])

    const permissions = await authzDynamo.getPrincipalPermissionsForEntities(principal, [document, document1], [
      { source: workspace, relation: Document.Relation.Owner }
    ], [Document.Permission.View, Document.Permission.Edit])

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(3)
    expect(permissions).toEqual([{
      resource: document,
      permissions: [Document.Permission.Edit, Document.Permission.View]
    }, {
      resource: document1,
      permissions: [Document.Permission.Edit, Document.Permission.View]
    }])
  })

  test('should resolve deep transitive permissions', async () => {
    const principal = new User('user-id')
    const document = new Document('document-id')
    const workspace = new Workspace('workspace-id')
    const org = new Org('org-id')

    mockDbRelations([
      {source: principal, target: org, relation: 'administrator'},
      {source: org, target: workspace, relation: 'owner'},
      {source: workspace, target: document, relation: 'owner'},
    ])

    const permissions = await authzDynamo.getPrincipalPermissionsForEntities(principal, [document], [
      { source: workspace, relation: Document.Relation.Owner },
      { source: org, relation: Workspace.Relation.Owner }
    ], [Document.Permission.View, Document.Permission.Edit])

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(6)
    expect(permissions).toEqual([{
      resource: document,
      permissions: [Document.Permission.Edit, Document.Permission.View]
    }])
  })
})

describe('principalHasPermission', () => {
  test('should create right request to dynamo', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDynamoCommand = new GetCommand({
      TableName: TEST_TABLE,
      Key: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({}))
    await authzDynamo.principalHasPermission(principal, resource, Org.Permission.Administer)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should return true when the user has the permission', async () => {
    const principal = new User('user-id')
    const resource = new Workspace('workspace-id')

    mockDbRelations([
      {source: principal, target: resource, relation: 'member'},
    ])

    const result = await authzDynamo.principalHasPermission(principal, resource, Workspace.Permission.Edit)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(2)
    expect(result).toBe(true)
  })

  test('should return false when the user does not have the permission', async () => {
    const principal = new User('user-id')
    const resource = new Workspace('workspace-id')

    mockDbRelations([
      {source: principal, target: resource, relation: 'member'},
    ])

    const result = await authzDynamo.principalHasPermission(principal, resource, Workspace.Permission.Administer)

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(2)
    expect(result).toBe(false)
  })

  test('should correctly lookup transitive permissions', async () => {
    const principal = new User('user-id')
    const workspace = new Workspace('workspace-id')
    const org = new Org('org-id')

    mockDbRelations([
      {source: principal, target: org, relation: 'administrator'},
      {source: org, target: workspace, relation: 'owner'},
    ])

    const result = await authzDynamo.principalHasPermission(principal, workspace, Workspace.Permission.Administer)

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(3)
    expect(result).toBe(true)
  })
})

describe('removeRelations', () => {
  test('should create right requests to dynamo', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDeleteCommand = new TransactWriteCommand({
      TransactItems: [{
        Delete: {
          TableName: TEST_TABLE,
          Key: {
            PK: `${principal.__typename}#${principal.id}`,
            SK: `${resource.__typename}#${resource.id}`,
          }
        }
      }]
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Items: [{
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }],
      LastEvaluatedKey: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`
      },
    }))

    await authzDynamo.removeRelations([
      {principal, resource}
    ])

    expect(DynamoDBClient.prototype.send).toHaveBeenLastCalledWith(
        expect.toBeMatchingDynamoCommand(expectedDeleteCommand),
    )
  })
})

describe('removeAllObjectRelations', () => {
  test('should create right requests to dynamo', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDeleteCommand = new TransactWriteCommand({
      TransactItems: [{
        Delete: {
          TableName: TEST_TABLE,
          Key: {
            PK: `${principal.__typename}#${principal.id}`,
            SK: `${resource.__typename}#${resource.id}`,
          }
        }
      }]
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({
      Items: [{
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }],
      LastEvaluatedKey: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`
      },
    }))

    await authzDynamo.removeAllObjectRelations(resource)

    expect(DynamoDBClient.prototype.send).toHaveBeenCalledTimes(2)
    expect(DynamoDBClient.prototype.send).toHaveBeenLastCalledWith(
        expect.toBeMatchingDynamoCommand(expectedDeleteCommand),
    )
  })
})

const mockDbRelations = (relations: ObjectsRelation<unknown>[]) => {
  jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation((arg) => {
    if (arg.constructor.name === 'QueryCommand') {
      const queryInput = (arg as QueryCommand).input

      const searchedRelations = relations.filter((relation: ObjectsRelation<unknown>) => {
        return queryInput.ExpressionAttributeValues &&
            queryInput.ExpressionAttributeValues[':sk'] === `${relation.target.__typename}#${relation.target.id}` &&
            queryInput.ExpressionAttributeValues[':pk'] === relation.source.__typename
      })

      const relationDbItems = searchedRelations.map((relation: ObjectsRelation<unknown>) => {
        return {
          PK: `${relation.source.__typename}#${relation.source.id}`,
          SK: `${relation.target.__typename}#${relation.target.id}`,
          Relation: relation.relation as string,
        }
      })

      return Promise.resolve({
        Items: relationDbItems,
      })
    }

    if (arg.constructor.name === 'GetCommand') {
      const getInput = (arg as GetCommand).input
      const matchingRelation = relations.find((relation: ObjectsRelation<unknown>) => {
        return getInput.Key && getInput.Key.PK === `${relation.source.__typename}#${relation.source.id}` &&
            getInput.Key.SK === `${relation.target.__typename}#${relation.target.id}`
      })

      if (matchingRelation) {
        return Promise.resolve({
          PK: `${matchingRelation.source.__typename}#${matchingRelation.source.id}`,
          SK: `${matchingRelation.target.__typename}#${matchingRelation.target.id}`,
          Item: {
            Relation: matchingRelation.relation
          }
        })
      }

      return Promise.resolve({})
    }

    if (arg.constructor.name === 'BatchGetCommand') {
      const getInput = (arg as BatchGetCommand).input
      const responses: {
        [k: string]: {
          PK: string,
          SK: string,
          Relation: string,
        }[]
      } = {}

      relations.forEach((relation: ObjectsRelation<unknown>) => {
        if (getInput.RequestItems) {
          Object.entries(getInput.RequestItems).forEach((entry) => {
            const tableName: string = entry[0]
            if (entry[1].Keys) {
              responses[tableName] = (responses[tableName] || []).concat(entry[1].Keys.flatMap((key) => {
                if (key.PK === `${relation.source.__typename}#${relation.source.id}` &&
                    key.SK === `${relation.target.__typename}#${relation.target.id}`) {
                  return [{
                    PK: `${relation.source.__typename}#${relation.source.id}`,
                    SK: `${relation.target.__typename}#${relation.target.id}`,
                    Relation: relation.relation as string,
                  }]
                }
                return []
              }))
            }
          })
        }
      })

      return Promise.resolve({
        Responses: responses,
      })
    }
  })
}