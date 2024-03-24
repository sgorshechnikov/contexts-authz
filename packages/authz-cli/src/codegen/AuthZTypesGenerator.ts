import {
  AuthzModel,
  Permission,
  PermissionExpression,
  Relation,
  TypeDefinition
} from "@contexts-authz/authz-grammar";
import _ from "lodash";
import * as dom from 'dts-dom';
import {ClassDeclaration, DeclarationFlags, NamespaceDeclaration, TopLevelDeclaration} from 'dts-dom';

const OBJECT_DEF_INTERFACE_NAME = 'ObjectDefinition';
const objectDefinitionImport = dom.create.importNamed(OBJECT_DEF_INTERFACE_NAME, '@contexts-authz/authz-model');

const pascalCase = (input: string) => {
  return _.camelCase(input).replace(/^[a-z]/, (c: string) => c.toUpperCase())
}

export class AuthZTypesGenerator {
  constructor(readonly model: AuthzModel) {
  }

  generate(): string {
    const typeDeclarations: TopLevelDeclaration[] = []

    const typeDeclarationsEnum = this.generateTypesDeclarationsEnum(this.model.definitions)

    typeDeclarations.push(typeDeclarationsEnum)

    this.model.definitions.forEach((definition) => {
      typeDeclarations.push(...this.generateTypesForDefinition(definition))
    })

    return [objectDefinitionImport as TopLevelDeclaration].concat(typeDeclarations)
        .map((declaration) => {
          if (declaration.kind === 'namespace') {
            let namespaceDeclaration = dom.emit(declaration)
            declaration.members.forEach((member) => {
              if (member.kind === 'function') {
                // @ts-expect-error - library doesn't let define function body
                const body = member.body
                if (body) {
                  const signature = dom.emit(member).replace(/;/, ' {')
                  const close = '}'
                  namespaceDeclaration = namespaceDeclaration.replace(dom.emit(member).replace('export ', ''), `${signature}\n${body}\n${close}`)
                }
              }
            })
            return namespaceDeclaration
          }

          return dom.emit(declaration)
        })
        .join('')
        .replace(/(?:export)? const enum/g, 'export enum')
        .replace(/constructor\((.*)\);/g, "constructor($1) {}")
        .replace(/__typename: "(\w+)";/g, '__typename = "$1";')
  }

  private generateTypesForDefinition(definition: TypeDefinition): (ClassDeclaration | NamespaceDeclaration) [] {
    const declarations = []
    const pascalCaseName = pascalCase(definition.name)

    const objClass = dom.create.class(pascalCaseName, DeclarationFlags.Export)
    const constructor = dom.create.constructor([dom.create.parameter('readonly id', dom.type.string)])
    objClass.members.push(constructor)
    objClass.members.push(dom.create.property('__typename', dom.type.stringLiteral(definition.name)))
    declarations.push(objClass)

    if (definition.permissions.length > 0 || definition.relations.length > 0) {
      const namespace = dom.create.namespace(pascalCaseName)
      namespace.flags = DeclarationFlags.Export
      let permissionTypeParameter = 'void'
      let relationTypeParameter = 'void'

      if (definition.permissions.length > 0) {
        permissionTypeParameter = `${namespace.name}.Permission`
        const permissionEnum = this.generatePermissionEnum(definition.permissions)
        namespace.members.push(permissionEnum)
      }

      if (definition.relations.length > 0) {
        relationTypeParameter = `${namespace.name}.Relation`
        const relationsEnum = this.generateRelationsEnum(definition.relations)
        namespace.members.push(relationsEnum)
      }

      if (definition.permissions.length > 0 && definition.relations.length > 0) {
        const hasPermissionFunction = dom.create.function('hasPermission', [
          dom.create.parameter('relation', dom.create.namedTypeReference('Relation')),
          dom.create.parameter('permission', dom.create.namedTypeReference('Permission'))
        ], dom.type.boolean, DeclarationFlags.Export)

        // @ts-expect-error - library doesn't let define function body
        hasPermissionFunction.body = `switch (permission) {
            ${definition.permissions.map((permission) => {
              const applicableRelations = definition.relations.filter((relation) => {
                const permissionExpressionIncludesRelation = (expression: PermissionExpression): boolean => {
                  if (expression.lhs.name === relation.name) {
                    return true
                  }
                  if (expression.rhs) {
                    return permissionExpressionIncludesRelation(expression.rhs)
                  }
                  return false
                }
                return permission.permissionExpression.some((exp) => {
                  return permissionExpressionIncludesRelation(exp)
                })
              })
          return `case Permission.${pascalCase(permission.name)}:
                return [${applicableRelations.map((relation) => `Relation.${pascalCase(relation.name)}`)}].includes(relation);`
        }).join('\n')}
            default:
                return false;
        }`
        namespace.members.push(hasPermissionFunction)
      }

      declarations.push(namespace)

      const objectDefinitionInt =
          dom.create.interface(`${OBJECT_DEF_INTERFACE_NAME}<${permissionTypeParameter}, ${relationTypeParameter}>`);

      objClass.implements.push(objectDefinitionInt)
    } else {
      objClass.implements.push(
          dom.create.interface(OBJECT_DEF_INTERFACE_NAME)
      )
    }

    return declarations
  }

  private generateTypesDeclarationsEnum(definitions: TypeDefinition[]) {
    const typeDeclarationsEnum = dom.create.enum('AuthzDefinitions', true, DeclarationFlags.Export)
    typeDeclarationsEnum.members = definitions.map((definition) => {
      return dom.create.enumValue(pascalCase(definition.name), definition.name)
    })
    return typeDeclarationsEnum
  }

  private generatePermissionEnum(permissions: Permission[]) {
    const permissionEnum = dom.create.enum('Permission', true, DeclarationFlags.Export)
    permissionEnum.members = permissions.map((permission) => {
      return dom.create.enumValue(pascalCase(permission.name), permission.name)
    })
    return permissionEnum
  }

  private generateRelationsEnum(relations: Relation[]) {
    const relationEnum = dom.create.enum('Relation', true, DeclarationFlags.Export)
    relationEnum.members = relations.map((relation) => {
      return dom.create.enumValue(pascalCase(relation.name), relation.name)
    })
    return relationEnum
  }
}