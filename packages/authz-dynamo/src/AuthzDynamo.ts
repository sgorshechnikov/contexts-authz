import {
  Authz,
  ObjectDefinition, ObjectPermissions,
  ObjectRelation,
  ObjectRelations,
  ObjectsRelation
} from '@contexts-authz/authz-model';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {BatchGetCommand, GetCommand, QueryCommand, TransactWriteCommand} from "@aws-sdk/lib-dynamodb";
import {AuthzModel, buildAst,} from "@contexts-authz/authz-grammar";
import {NativeAttributeValue} from "@aws-sdk/util-dynamodb";
import {
  applicableRelations,
  permissionsForRelation, PossiblePermission,
  possiblePermissionsForPrincipal,
  requireTypeDefinition
} from "./util";
import _ from "lodash";

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

  async addRelations<R>(relations: ObjectsRelation<R>[]): Promise<void> {
    relations.forEach((relation) => {
      const typeDefinition = requireTypeDefinition(relation.target.__typename, this.model.definitions)
      if (!applicableRelations(relation.source.__typename, typeDefinition).includes(relation.relation as string)) {
        throw new Error(`Invalid relation: ${relation.source.__typename}#${relation.source.id} -> ${relation.target.__typename}#${relation.target.id}: ${relation}`)
      }
    })

    const command = new TransactWriteCommand({
      TransactItems: relations.map(relation => {
        return {
          Put: {
            TableName: this.config.tableName,
            Item: {
              PK: `${relation.source.__typename}#${relation.source.id}`,
              SK: `${relation.target.__typename}#${relation.target.id}`,
              Relation: relation.relation,
            }
          }
        }
      })
    })

    const result = await this.dynamoClient.send(command)

    if (!result) {
      throw new Error(`Failed to create new relations: ${relations.map((relation) => `${relation.source.__typename}#${relation.source.id} -> ${relation.target.__typename}#${relation.target.id}: ${relation}`)}`)
    }
  }

  async getPermissions<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>, requestedPermissions?: P[]): Promise<P[]> {
    const typeDefinition = requireTypeDefinition(resource.__typename, this.model.definitions)

    const possiblePermissions = possiblePermissionsForPrincipal(principal.__typename, resource.__typename, this.model.definitions).filter((permission) => {
      return requestedPermissions === undefined || requestedPermissions.includes(permission.name as P)
    })

    if (possiblePermissions.length === 0) {
      return []
    }

    const possibleTransitivePermissions = possiblePermissions.filter((permission) => {
      return permission.type === 'transitive'
    })

    const loadTransitiveRelations: Promise<ObjectRelations<unknown>[]> = Promise.all(_.uniqWith(possibleTransitivePermissions.map((permission) => {
      return permission.transitiveRelation
    }), _.isEqual).flatMap<Promise<ObjectRelations<unknown>>>((relation) => {
      if (relation) {
        const relationName = relation.relationName
        return [this.getRelations(resource, 500, relation.targetType).then((res: ObjectRelations<unknown>) => {
          return {
            ...res,
            relations: res.relations.filter((relation) => {
              return relation.relation === relationName
            })
          }
        })]
      }
      return []
    }))

    const command = new GetCommand({
      TableName: this.config.tableName,
      Key: {
        PK: `${principal.__typename}#${principal.id}`,
        SK: `${resource.__typename}#${resource.id}`,
      }
    })

    const [result, transitiveRelations] = await Promise.all([
      this.dynamoClient.send(command),
      loadTransitiveRelations
    ])

    const directPermissions =
        (result?.Item && applicableRelations(principal.__typename, typeDefinition).includes(result.Item.Relation)) ?
          permissionsForRelation(result.Item.Relation, typeDefinition) : []

    const unresolvedPermissions = possiblePermissions.filter((permission) => {
      return !directPermissions.includes(permission.name)
    })

    const permissionsToLookUpTransitively = unresolvedPermissions.filter((permission) => {
      return permission.type === 'transitive'
    })

    if (permissionsToLookUpTransitively.length === 0) {
      return directPermissions as P[]
    }

    const transitivePermissions: Promise<P[]>[] = transitiveRelations.flatMap((relation: ObjectRelations<unknown>) => {
      return relation.relations.map(async (relation) => {
        return await this.getPermissions(principal, relation.object).then((permissions) => {
          return permissions.flatMap((permission) => {
            return permissionsToLookUpTransitively.flatMap((perm) => {
              if (perm.transitiveRelation?.targetType === relation.object.__typename && perm.transitiveRelation?.targetPermission === permission) {
                return [perm.name as P]
              }
              return []
            })
          })
        })
      })
    })

    return Promise.all(transitivePermissions).then((permissions) => {
      return (directPermissions as P[]).concat(permissions.flat())
    })
  }

  async getRelations<R>(resource: ObjectDefinition<unknown, R>, first: number, principalType?: string, after?: string): Promise<ObjectRelations<R>> {
    requireTypeDefinition(resource.__typename, this.model.definitions)

    const command = new QueryCommand({
      TableName: this.config.tableName,
      IndexName: "RolesByResource",
      KeyConditionExpression: `SK = :sk${principalType ? ' AND begins_with(PK, :pk)' : ''}`,
      ExpressionAttributeValues: {
        ":sk": `${resource.__typename}#${resource.id}`,
        ...(principalType ? {":pk": principalType} : {})
      },
      Limit: first,
      ExclusiveStartKey: after ? {
        SK: `${resource.__typename}#${resource.id}`,
        PK: atob(after)
      } : undefined
    })

    const data = await this.dynamoClient.send(command)
    if (!data || !data.Items) {
      throw new Error(`Failed to fetch relations for entity ${resource.__typename}#${resource.id}@#${principalType}`)
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
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
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
    if (resources.length === 0) {
      return Promise.resolve([])
    }

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

  async getPrincipalPermissionsForEntities<P, R>(
      principal: ObjectDefinition<unknown, unknown>,
      resources: ObjectDefinition<P, R>[],
      transitiveResources: {
        source: ObjectDefinition<unknown, unknown>,
        relation: R,
      }[],
      requestedPermissions: P[]
  ): Promise<ObjectPermissions<P>[]> {

    if (resources.length === 0) {
      return Promise.resolve([])
    }

    const resourcesType = resources[0].__typename

    if (!resources.every(resource => resource.__typename === resourcesType)) {
      throw new Error('All resources must be of the same type')
    }

    const typeDefinition = requireTypeDefinition(resourcesType, this.model.definitions)

    const possiblePermissions = possiblePermissionsForPrincipal(principal.__typename, resourcesType, this.model.definitions).filter((permission) => {
      return requestedPermissions === undefined || requestedPermissions.includes(permission.name as P)
    })

    if (possiblePermissions.length === 0) {
      return []
    }

    const possibleTransitivePermissions = possiblePermissions.filter((permission) => {
      return permission.type === 'transitive'
    })

    const loadTransitiveRelations: Promise<ObjectsRelation<unknown>[]> = Promise.all(_.uniqWith(possibleTransitivePermissions.map((permission) => {
      return permission.transitiveRelation
    }), _.isEqual).flatMap((relation) => {
      if (relation) {
        const relationName = relation.relationName
        const transitiveRelationsToVerify = transitiveResources.filter((relation) => {
          return relation.relation === relationName
        })
        return transitiveRelationsToVerify.map(async (relation) => {
          return await this.resolveRelations(resources.map((resource) => {
            return {
              source: relation.source,
              target: resource,
            }
          }))
        })
      }
      return []
    })).then((relations) => relations.flat())

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

    const [data, transitiveRelations] = await Promise.all([
      this.dynamoClient.send(command),
      loadTransitiveRelations
    ])

    if (!data || !data.Responses || !data.Responses[this.config.tableName]) {
      throw new Error(`Failed to fetch permissions for principal ${principal.__typename}#${principal.id}`)
    }

    const directPermissions: ObjectPermissions<P>[] = data.Responses[this.config.tableName].map((item: Record<string, NativeAttributeValue>) => {
      return {
        resource: {
          __typename: item.SK.split('#')[0],
          id: item.SK.split('#')[1],
        } as ObjectDefinition<unknown, unknown>,
        permissions: permissionsForRelation(item.Relation, typeDefinition) as P[],
      }
    })

    const allResolved = (permissions: ObjectPermissions<P>[]) => resources.every(resource =>
        permissions.some((permission) =>
            permission.resource.id === resource.id && requestedPermissions.every((requestedPermission) => permission.permissions.includes(requestedPermission))
        )
    )

    if (allResolved(directPermissions)) {
      return directPermissions.map((permission) => {
        return {
          ...permission,
          permissions: permission.permissions.filter((permission) => requestedPermissions.includes(permission))
        }
      }) as ObjectPermissions<P>[]
    }

    const transitiveResourcesPermissions = await this.getPrincipalPermissionsForEntities(
        principal,
        transitiveRelations.map((relation) => relation.source),
        transitiveResources.filter((resource) => {
          return !transitiveRelations.some((relation) => {
            return relation.relation === resource.relation && relation.source.__typename === resource.source.__typename
          })
        }),
        possibleTransitivePermissions.map((permission) => permission.transitiveRelation?.targetPermission as P))

    const transitivePermissions = resources.flatMap((resource) => {
      return possibleTransitivePermissions.flatMap((permission: PossiblePermission) => {
        const matchingPermission = transitiveRelations.some((relation) => {
          const transitivePermission = transitiveResourcesPermissions.find((permission) => {
            return permission.resource.id === relation.source.id
          })
          return transitivePermission && relation.target.id === resource.id &&
              relation.relation === permission.transitiveRelation?.relationName &&
              transitivePermission.permissions.includes(permission.transitiveRelation?.targetPermission)
        })

        if (matchingPermission) {
          return [{
            resource: resource,
            permissions: [permission.name as P]
          }]
        }
        return []
      })
    })

    const allPermissions =
        Object.entries(_.groupBy(directPermissions.concat(transitivePermissions), (permission) => permission.resource.id))
            .map(([, permissions]) => permissions.reduce((acc, permission) => {
              return {
                resource: permission.resource,
                permissions: _.uniq(acc.permissions.concat(permission.permissions))
              }
            }))

    return [...allPermissions]
  }

  private async resolveRelations(pairs: { source: ObjectDefinition<unknown, unknown>, target: ObjectDefinition<unknown, unknown> }[]): Promise<ObjectsRelation<unknown>[]> {
    const command = new BatchGetCommand({
      RequestItems: {
        [this.config.tableName]: {
          Keys: pairs.map(pair => ({
            PK: `${pair.source.__typename}#${pair.source.id}`,
            SK: `${pair.target.__typename}#${pair.target.id}`,
          }))
        }
      }
    })

    const data = await this.dynamoClient.send(command)

    if (!data || !data.Responses || !data.Responses[this.config.tableName]) {
      throw new Error(`Failed to fetch relations for ${pairs.length} object pairs.`)
    } else {
      return data.Responses[this.config.tableName].map((item: Record<string, NativeAttributeValue>) => {
        return {
          source: {
            __typename: item.PK.split('#')[0],
            id: item.PK.split('#')[1],
          },
          target: {
            __typename: item.SK.split('#')[0],
            id: item.SK.split('#')[1],
          },
          relation: item.Relation
        }
      })
    }
  }

  async principalHasPermission<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>, permission: P): Promise<boolean> {
    const permissions = await this.getPermissions(principal, resource, [permission])
    return permissions.includes(permission)
  }

  async removeRelations(relations: { principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, unknown> }[]): Promise<void> {
    const command = new TransactWriteCommand({
      TransactItems: relations.map(relation => {
        return {
          Delete: {
            TableName: this.config.tableName,
            Key: {
              PK: `${relation.principal.__typename}#${relation.principal.id}`,
              SK: `${relation.resource.__typename}#${relation.resource.id}`,
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
            PK: `${relation.object.__typename}#${relation.object.id}`,
            SK: `${relationsToDelete.resource.__typename}#${relationsToDelete.resource.id}`,
          }
        }
      }))
    })

    await this.dynamoClient.send(command)
  }

}