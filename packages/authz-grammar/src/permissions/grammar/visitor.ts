import {parse, parser} from "./parser";
import {
  AuthzRulesNode,
  RelationRelationalOperatorNode,
  RelationExpressionNode,
  RelationNode,
  TypeDefinitionNode,
  PermissionRelationalOperatorNode,
  PermissionExpressionNode,
  PermissionNode,
  RelationReferenceNode
} from "./nodes";
import {
  AuthzModel,
  ModelType,
  PermissionExpression, PermissionRelationalOperator,
  Relation,
  Permission,
  RelationExpression,
  RelationRelationalOperator,
  TypeDefinition, RelationReference
} from "./models";

export class AuthzAstBuilderVisitor extends parser.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  authzRules(node: AuthzRulesNode): AuthzModel {
    return {
      type: ModelType.AuthzModel,
      definitions: node.typeDefinition.map((definition) => this.visit(definition)),
    };
  }

  typeDefinition(node: TypeDefinitionNode): TypeDefinition {
    // Each Terminal or Non-Terminal in a grammar rule are collected into
    // an array with the same name(key) in the ctx object.

    return {
      type: ModelType.Definition,
      name: node.typeName[0].image,
      relations: (node.relations || []).map((relation) => this.visit(relation)),
      permissions: (node.permissions || []).map((permission) => this.visit(permission)),
    };
  }

  relations(node: RelationNode): Relation {
    return {
      type: ModelType.Relation,
      name: node.relationName[0].image,
      relationExpression: node.relationExpression.map((relationExpression) => this.visit(relationExpression)),
    }
  }

  relationExpression(node: RelationExpressionNode): RelationExpression {
    return {
      type: ModelType.RelationExpression,
      lhs: {
        type: ModelType.TypeReference,
        name: node.lhs[0].image,
      },
      relationalOperator: this.visit(node.relationRelationalOperator),
      rhs: this.visit(node.rhs),
    }
  }

  relationRelationalOperator(node: RelationRelationalOperatorNode): RelationRelationalOperator {
    if (node.Pipe) {
      return RelationRelationalOperator["|"]
    }
    throw new Error("Unknown relational operator")
  }

  permissions(node: PermissionNode): Permission {
    return {
      type: ModelType.Permission,
      name: node.permissionName[0].image + (node.permissionClassifier ? `:${node.permissionClassifier.map(n => n.image).join(":")}` : ''),
      permissionExpression: node.permissionExpression.map((permissionExpression) => this.visit(permissionExpression)),
    }
  }

  permissionExpression(node: PermissionExpressionNode): PermissionExpression {
    return {
      type: ModelType.PermissionExpression,
      lhs: node.lhs.map((lhs) => this.visit(lhs))[0],
      relationalOperator: this.visit(node.permissionRelationalOperator),
      rhs: this.visit(node.rhs),
    }
  }

  relationReference(node: RelationReferenceNode): RelationReference {
    return {
      type: ModelType.RelationReference,
      name: node.relationName[0].image,
      childPermission: node.childPermission?.[0].image,
    }
  }

  permissionRelationalOperator(node: PermissionRelationalOperatorNode): PermissionRelationalOperator {
    if (node.Plus) {
      return PermissionRelationalOperator["+"]
    }
    throw new Error("Unknown relational operator")
  }
}

// Our visitor has no state, so a single instance is sufficient.
const astBuilder = new AuthzAstBuilderVisitor();

export function buildAst(text: string): AuthzModel {
  const cst = parse(text);
  return astBuilder.visit(cst);
}
