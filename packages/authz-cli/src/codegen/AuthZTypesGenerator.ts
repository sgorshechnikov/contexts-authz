import {AuthzModel, Permission, Relation, TypeDefinition} from "@contexts-authz/authz-grammar";
import _ from "lodash";
import * as dom from 'dts-dom';
import {
  ClassDeclaration,
  DeclarationFlags,
  NamespaceDeclaration,
  TopLevelDeclaration
} from 'dts-dom';

const OBJECT_DEF_INTERFACE_NAME = 'ObjectDefinition';
const objectDefinitionImport = dom.create.importNamed(OBJECT_DEF_INTERFACE_NAME, '@contexts-authz/authz-model');

const pascalCase = (input: string) => {
  return _.camelCase(input).replace(/^[a-z]/, (c: string) => c.toUpperCase())
}

export class AuthZTypesGenerator {
  constructor(readonly model: AuthzModel) {
  }

  generate(): string {
    const typeDeclarations: (ClassDeclaration | NamespaceDeclaration)[] = []

    this.model.definitions.forEach((definition) => {
      typeDeclarations.push(...this.generateTypesForDefinition(definition))
    })

    return [objectDefinitionImport as TopLevelDeclaration].concat(typeDeclarations)
        .map((declaration) => dom.emit(declaration))
        .join('\n\n')
        .replace(/const enum/g, 'export enum')
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