import {Authz, ObjectDefinition, ObjectRelation, ObjectRelations} from '@contexts-authz/authz-model';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {BatchGetCommand, GetCommand, PutCommand, QueryCommand, TransactWriteCommand} from "@aws-sdk/lib-dynamodb";
import {AuthzModel, buildAst,} from "@contexts-authz/authz-grammar";
import {NativeAttributeValue} from "@aws-sdk/util-dynamodb";
import {applicableRelations, permissionsForRelation, requireTypeDefinition} from "./util";

type DbConfig = {
  tableName: string,
  authzDefinition: string,
}

export class AuthzDynamo implements Authz {
  private readonly model: AuthzModel

  constructor(
      readonly dynamoClient: DynamoDBClient,
      readonly config: DbConfig
  ) {
    this.model = buildAst(config.authzDefinition)
  }

  async addRelation<R>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, R>, relation: R): Promise<void> {
    const typeDefinition = requireTypeDefinition(resource.__typename, this.model.definitions)
    if (!applicableRelations(principal.__typename, typeDefinition).includes(relation as string)) {
      throw new Error(`Invalid relation: ${principal.__typename}#${principal.id} -> ${resource.__typename}#${resource.id}: ${relation}`)
    }

    const command = new PutCommand({
      TableName: this.config.tableName,
      Item: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
        Relation: relation,
      },
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
    })

    const result = await this.dynamoClient.send(command)

    if (!result) {
      throw new Error(`Failed to create new relation: ${principal.__typename}#${principal.id} -> ${resource.__typename}#${resource.id}: ${relation}`)
    }
  }

  async getPermissions<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>): Promise<P[]> {
    // this should traverse the graph and find all permissions for the principal

    const typeDefinition = requireTypeDefinition(resource.__typename, this.model.definitions)

    const command = new GetCommand({
      TableName: this.config.tableName,
      Key: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }
    })

    const result: Record<string, NativeAttributeValue> = await this.dynamoClient.send(command)
    if (!result || !result.Item) {
      return []
    } else {
      const relation: string = result.Item.Relation
      if (!applicableRelations(principal.__typename, typeDefinition).includes(relation)) {
        return []
      }

      return permissionsForRelation(relation, typeDefinition) as P[]
    }
  }

  async getRelations<R>(resource: ObjectDefinition<unknown, R>, first: number, after?: string): Promise<ObjectRelations<R>> {
    requireTypeDefinition(resource.__typename, this.model.definitions)

    const command = new QueryCommand({
      TableName: this.config.tableName,
      IndexName: "RolesByResource",
      KeyConditionExpression: "SK = :sk",
      ExpressionAttributeValues: {
        ":sk": `${resource.__typename}#${resource.id}`,
      },
      Limit: first,
      ExclusiveStartKey: after ? {
        SK: `${resource.__typename}#${resource.id}`,
        PK: atob(after)
      } : undefined
    })

    const data = await this.dynamoClient.send(command)
    if (!data || !data.Items) {
      throw new Error(`Failed to fetch relations for entity ${resource.__typename}#${resource.id}`)
    } else {
      return {
        resource: resource,
        relations: data.Items.map((item: Record<string, NativeAttributeValue>) => {
          return {
            object: {
              __typename: item.PK.split('#')[0],
              id: item.PK.split('#')[1],
            } as ObjectDefinition<unknown, unknown>,
            relation: item.Relation as R,
            cursor: btoa(item.PK),
          }
        }),
        cursor: data.LastEvaluatedKey ? btoa((data.LastEvaluatedKey as Record<string, NativeAttributeValue>).PK) : undefined,
      }
    }
  }

  async getRelation<R>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, R>): Promise<R | undefined> {
    const typeDefinition = requireTypeDefinition(resource.__typename, this.model.definitions)
    const command = new GetCommand({
      TableName: this.config.tableName,
      Key: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }
    })

    const result: Record<string, NativeAttributeValue> = await this.dynamoClient.send(command)
    if (!result || !result.Item) {
      return undefined
    } else {
      const relation: string = result.Item.Relation
      if (!applicableRelations(principal.__typename, typeDefinition).includes(relation)) {
        throw new Error(`Invalid relation: ${principal.__typename}#${principal.id} -> ${resource.__typename}#${resource.id}: ${relation}`)
      }

      return relation as R
    }
  }

  async getRelationsForPrincipal(principal: ObjectDefinition<unknown, unknown>, resourceType: string, first: number, after?: string): Promise<ObjectRelations<unknown>> {
    const command = new QueryCommand({
      TableName: this.config.tableName,
      KeyConditionExpression: "PK = :sk AND begins_with(SK, :pk)",
      ExpressionAttributeValues: {
        ":pk": `${principal.__typename}#${principal.id}`,
        ":sk": `${resourceType}#`,
      },
      Limit: first,
      ExclusiveStartKey: after ? {
        PK: `${principal.__typename}#${principal.id}`,
        SK: atob(after)
      } : undefined
    })

    const data = await this.dynamoClient.send(command)

    if (!data || !data.Items) {
      throw new Error(`Failed to fetch relations for principal ${principal.__typename}#${principal.id}`)
    } else {
      return {
        resource: principal,
        relations: data.Items.map((item: Record<string, NativeAttributeValue>) => {
          return {
            object: {
              __typename: item.SK.split('#')[0],
              id: item.SK.split('#')[1],
            } as ObjectDefinition<unknown, unknown>,
            relation: item.Relation as unknown,
            cursor: btoa(item.SK),
          }
        }),
        cursor: data.LastEvaluatedKey ? btoa((data.LastEvaluatedKey as Record<string, NativeAttributeValue>).SK) : undefined,
      }
    }

  }

  async getPrincipalRelationsForEntities<R>(principal: ObjectDefinition<unknown, unknown>, resources: ObjectDefinition<unknown, R>[]): Promise<ObjectRelation<R>[]> {
    const command = new BatchGetCommand({
      RequestItems: {
        [this.config.tableName]: {
          Keys: resources.map(resource => ({
            PK: `${principal.__typename}#${principal.id}`,
            SK: `${resource.__typename}#${resource.id}`,
          }))
        }
      }
    })

    const data = await this.dynamoClient.send(command)

    if (!data || !data.Responses || !data.Responses[this.config.tableName]) {
      throw new Error(`Failed to fetch relations for principal ${principal.__typename}#${principal.id}`)
    } else {
      return data.Responses[this.config.tableName].map((item: Record<string, NativeAttributeValue>) => {
        return {
          object: {
            __typename: item.SK.split('#')[0],
            id: item.SK.split('#')[1],
          } as ObjectDefinition<unknown, unknown>,
          relation: item.Relation as R,
        }
      })
    }
  }

  async principalHasPermission<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>, permission: P): Promise<boolean> {
    const permissions = await this.getPermissions(principal, resource)
    return permissions.includes(permission)
  }

  async removeRelations(relations: {principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, unknown>}[]): Promise<void> {
    const command = new TransactWriteCommand({
      TransactItems: relations.map(relation => {
        return {
          Delete: {
            TableName: this.config.tableName,
            Key: {
              PK: {S: `${relation.principal.__typename}#${relation.principal.id}`},
              SK: {S: `${relation.resource.__typename}#${relation.resource.id}`},
            }
          }
        }
      })
    })

    await this.dynamoClient.send(command)
  }

  async removeAllObjectRelations(object: ObjectDefinition<unknown, unknown>): Promise<void> {
    //TODO: Fix this
    const relationsToDelete = await this.getRelations(object, 500)
    const command = new TransactWriteCommand({
      TransactItems: relationsToDelete.relations.map((relation) => ({
        Delete: {
          TableName: this.config.tableName,
          Key: {
            PK: {S: `${relation.object.__typename}#${relation.object.id}`},
            SK: {S: `${relationsToDelete.resource.__typename}#${relationsToDelete.resource.id}`},
          }
        }
      }))
    })

    await this.dynamoClient.send(command)
  }

}