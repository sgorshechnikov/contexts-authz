import {getAuthZDefs} from "./test-helpers";
import {AuthzDynamo} from "../src/AuthzDynamo";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {Org, User, Workspace} from "./test-model";
import {BatchGetCommand, GetCommand, PutCommand, QueryCommand, TransactWriteCommand} from "@aws-sdk/lib-dynamodb"
import './toBeMatchingDynamoCommand';

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

describe('addRelation', () => {
  test('should create right request to dynamo', async () => {
    const principal = new User('user-id')
    const resource = new Org('org-id')

    const expectedDynamoCommand = new PutCommand({
      TableName: TEST_TABLE,
      Item: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
        Relation: Org.Relation.Administrator,
      },
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
    })

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({}))
    await authzDynamo.addRelation(principal, resource, Org.Relation.Administrator)
    expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(expect.toBeMatchingDynamoCommand(expectedDynamoCommand))
  })

  test('should fail if there is no applicable relations', async () => {
    const resource = new Org('org-id')

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => Promise.resolve({}))
    await expect(authzDynamo.addRelation(resource, resource, Org.Relation.Administrator)).rejects.toThrow()
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
    const resource = new Workspace('workspace-id')

    jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => {
      return Promise.resolve({
        Item: {
          Relation: 'member'
        }
      })
    })
    const result = await authzDynamo.getPermissions(principal, resource)
    expect(result).toEqual([Workspace.Permission.Edit, Workspace.Permission.View])
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
    await authzDynamo.getRelations(resource, first, btoa(`${relationObject.__typename}#${relationObject.id}`))

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

  describe('getRelationsForPrincipal', () => {
    test('should create right request to dynamo', async () => {
      const first = 10
      const principal = new User('user-id')
      const resource = new Org('org-id')

      const expectedDynamoCommand = new QueryCommand({
        TableName: TEST_TABLE,
        KeyConditionExpression: "PK = :sk AND begins_with(SK, :pk)",
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
        KeyConditionExpression: "PK = :sk AND begins_with(SK, :pk)",
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

      jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => {
        return Promise.resolve({
          Item: {
            Relation: 'member'
          }
        })
      })
      await authzDynamo.principalHasPermission(principal, resource, Workspace.Permission.Edit)
    })

    test('should return false when the user does not have the permission', async () => {
      const principal = new User('user-id')
      const resource = new Workspace('workspace-id')

      jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(() => {
        return Promise.resolve({
          Item: {
            Relation: 'member'
          }
        })
      })
      await authzDynamo.principalHasPermission(principal, resource, Workspace.Permission.Administer)
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
              PK: { S: `${principal.__typename}#${principal.id}` },
              SK: { S: `${resource.__typename}#${resource.id}` },
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
        { principal, resource }
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
              PK: { S: `${principal.__typename}#${principal.id}` },
              SK: { S: `${resource.__typename}#${resource.id}` },
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
})