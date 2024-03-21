import {PermissionExpression, Relation, RelationExpression, TypeDefinition} from "@contexts-authz/authz-grammar";

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
        if (expression.lhs.name === relationName) {
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


