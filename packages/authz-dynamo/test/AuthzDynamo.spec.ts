import {getAuthZDefs} from "./test-helpers";
import {AuthzDynamo} from "../src/AuthzDynamo";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {Org, User, Workspace} from "./test-model";
import {GetCommand, PutCommand} from "@aws-sdk/lib-dynamodb"
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
          Relation: 'relation#member'
        }
      })
    })
    const result = await authzDynamo.getPermissions(principal, resource)
    expect(result).toEqual([Workspace.Permission.Edit, Workspace.Permission.View])
  })
})