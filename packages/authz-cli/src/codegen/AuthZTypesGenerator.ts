import {AuthzModel, TypeDefinition} from "@contexts-authz/authz-grammar";
import _ from "lodash";
import * as dom from 'dts-dom';
import {DeclarationFlags, TopLevelDeclaration} from 'dts-dom';

const objectDefinitionInt = dom.create.interface('ObjectDefinition', DeclarationFlags.Export);
objectDefinitionInt.typeParameters.push(dom.create.typeParameter('Permission = void'));
objectDefinitionInt.members.push(dom.create.property('id', dom.type.string));
objectDefinitionInt.members.push(dom.create.property('__typename', dom.type.string));

const pascalCase = (input: string) => {
  return _.camelCase(input).replace(/^[a-z]/, (c: string) => c.toUpperCase())
}

export class AuthZTypesGenerator {
  constructor(readonly model: AuthzModel, readonly options?: { namespace?: string }) {
  }

  generate(): string {
    const typeDeclarations = []
    typeDeclarations.push(objectDefinitionInt)
    this.model.definitions.forEach((definition) => {
      typeDeclarations.push(...this.generateTypesForDefinition(definition))
    })

    if (this.options?.namespace) {
      const namespace = dom.create.namespace(this.options.namespace)
      namespace.members.push(...typeDeclarations)
      return dom.emit(namespace)
    }

    return typeDeclarations.map((declaration) => dom.emit(declaration)).join('\n\n')
  }

  private generateTypesForDefinition(definition: TypeDefinition): TopLevelDeclaration[] {
    const declarations = []
    const pascalCaseName = pascalCase(definition.name)

    const objClass = dom.create.class(pascalCaseName, DeclarationFlags.Export)
    const constructor = dom.create.constructor([dom.create.parameter('id', dom.type.string)])
    objClass.members.push(dom.create.property('id', dom.type.string, DeclarationFlags.ReadOnly))
    objClass.members.push(constructor)
    objClass.members.push(dom.create.property('__typename', dom.type.stringLiteral(definition.name)))

    if (definition.permissions.length > 0) {
      const permissionEnum = dom.create.enum('Permission', true, DeclarationFlags.Export)
      permissionEnum.members = definition.permissions.map((permission) => {
        return dom.create.enumValue(pascalCase(permission.name), permission.name)
      })
      const namespace = dom.create.namespace(pascalCaseName)
      namespace.members.push(permissionEnum)
      declarations.push(namespace)

      const objectDefinitionInt = dom.create.interface(`ObjectDefinition<${namespace.name}.${permissionEnum.name}>`);
      objClass.implements.push(objectDefinitionInt)
    } else {
      objClass.implements.push(objectDefinitionInt)
    }

    declarations.push(objClass)

    return declarations
  }
}