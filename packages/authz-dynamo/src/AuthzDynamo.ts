import {Authz, ObjectDefinition, ResourceRelations} from '@contexts-authz/authz-model';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {GetCommand, PutCommand, QueryCommand} from "@aws-sdk/lib-dynamodb";
import {
  AuthzModel,
  buildAst,
} from "@contexts-authz/authz-grammar";
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

  async getRelations<R>(resource: ObjectDefinition<unknown, R>, first: number, after: string): Promise<ResourceRelations<R>> {
    requireTypeDefinition(resource.__typename, this.model.definitions)

    const command = new QueryCommand({
      TableName: this.config.tableName,
      IndexName: "RolesByResource",
      KeyConditionExpression: "SK = :sk AND begins_with(PK, :pk)",
      ExpressionAttributeValues: {
        ":sk": `${resource.__typename}#${resource.id}`,
        ":pk": "relation#",
      },
      Limit: first,
      ExclusiveStartKey: after ? {
        SK: `${resource.__typename}#${resource.id}`,
        PK: `relation#${btoa(after)}`
      } : undefined
    })

    const data = await this.dynamoClient.send(command)
    if (!data || !data.Items) {
      throw new Error(`Failed to fetch relations for entity ${resource.__typename}#${resource.id}`)
    } else {
      const cursor = atob((data.LastEvaluatedKey as Record<string, NativeAttributeValue>).PK.split('#')[0])
      return  {
        resource: resource,
        relations: data.Items.map((item: Record<string, NativeAttributeValue>) => {
          return {
            object: {
              __typename: item.PK.split('#')[1],
              id: item.PK.split('#')[2],
            } as ObjectDefinition<unknown, unknown>,
            relation: item.Relation as R,
          }
        }),
        cursor: cursor,
      }
    }
  }

  async getRelationForPrincipal<R>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, R>): Promise<R | undefined> {
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
        return undefined
      }

      return relation as R
    }
  }

  async principalHasPermission<P>(principal: ObjectDefinition<P, unknown>, resource: ObjectDefinition<unknown, unknown>, permission: P): Promise<boolean> {
    const permissions = await this.getPermissions(principal, resource)
    return permissions.includes(permission)
  }

}