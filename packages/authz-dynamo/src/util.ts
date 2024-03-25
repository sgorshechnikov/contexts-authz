import {PermissionExpression, Relation, RelationExpression, TypeDefinition} from "@contexts-authz/authz-grammar";
import _ from "lodash";

type PossiblePermissionType = 'direct' | 'transitive'

export type PossiblePermission = {
  name: string,
  type: PossiblePermissionType,
  transitiveRelation?: {
    relationName: string,
    targetType: string,
    targetPermission: string,
  }
}

export const applicableRelations: (typeName: string, typeDefinition: TypeDefinition) => string[] =
    (typeName: string, typeDefinition: TypeDefinition) => typeDefinition.relations.flatMap((relation: Relation) => {
      const isApplicable: (expression: RelationExpression) => boolean = (expression: RelationExpression) => {
        if (expression.lhs.name === typeName) {
          return true
        }
        return expression.rhs ? isApplicable(expression.rhs) : false
      }

      if (relation.relationExpression.some(isApplicable)) {
        return [relation.name]
      }

      return []
    })

export const permissionsForRelation: (relationName: string, typeDefinition: TypeDefinition) => string[] =
    (relationName: string, typeDefinition: TypeDefinition) => {
      const isApplicable: (expression: PermissionExpression) => boolean = (expression: PermissionExpression) => {
        if (expression.lhs.name === relationName && !expression.lhs.childPermission) {
          return true
        }
        return expression.rhs ? isApplicable(expression.rhs) : false
      }

      return typeDefinition.permissions
          .filter((permission) => permission.permissionExpression.some(isApplicable))
          .map((permission) => permission.name)
    }

export const requireTypeDefinition: (typeName: string, typeDefinitions: TypeDefinition[]) => TypeDefinition =
    (typeName: string, typeDefinitions: TypeDefinition[]) => {
      const typeDefinition: TypeDefinition | undefined = typeDefinitions.find((d) => d.name === typeName)

      if (!typeDefinition) {
        throw new Error(`Type definition not found for ${typeName}. Please check your authz definition.`)
      }

      return typeDefinition
    }

export const getRelationTypes: (relationName: string, typeDefinition: TypeDefinition) => string[] =
  (relationName: string, typeDefinition: TypeDefinition) => {
    return typeDefinition.relations.flatMap((relation: Relation) => {
      const getTypes = (expression: RelationExpression): string[] => {
        if (expression.rhs) {
          return [expression.lhs.name, ...getTypes(expression.rhs)]
        }
        return [expression.lhs.name]
      }
      if (relation.name === relationName) {
        return relation.relationExpression.flatMap((exp) => getTypes(exp))
      }
      return []
    })
  }

export const possiblePermissionsForPrincipal: (sourceType: string, targetType: string, typeDefinitions: TypeDefinition[]) => PossiblePermission[] =
  (principalType: string, targetType: string, typeDefinitions: TypeDefinition[]): PossiblePermission[] => {
    const targetTypeDefinition = requireTypeDefinition(targetType, typeDefinitions)
    const isApplicable: (permissionName: string, expression: PermissionExpression) => PossiblePermission[] = (permissionName: string, expression: PermissionExpression) => {
      const relationName = expression.lhs.name
      const relationTypes = getRelationTypes(relationName, targetTypeDefinition)
      const possiblePermissons: PossiblePermission[] = []
      if (!expression.lhs.childPermission) {
        if (relationTypes.includes(principalType)) {
          possiblePermissons.push({
            name: permissionName,
            type: 'direct'
          })
        }
      } else {
        relationTypes.forEach((type) => {
          if (type !== principalType) {
            possiblePermissionsForPrincipal(principalType, type, typeDefinitions).forEach((permission) => {
              if (permission.name === expression.lhs.childPermission) {
                possiblePermissons.push({
                  name: permissionName,
                  type: 'transitive',
                  transitiveRelation: {
                    relationName: expression.lhs.name,
                    targetType: type,
                    targetPermission: expression.lhs.childPermission,
                  }
                })
              }
            })
          }
        })
      }

      return possiblePermissons.concat(expression.rhs ? isApplicable(permissionName, expression.rhs) : [])
    }

    return _.uniqWith(targetTypeDefinition.permissions.flatMap((permission) => {
      return permission.permissionExpression.flatMap((exp) => isApplicable(permission.name, exp))
    }), _.isEqual)
  }


