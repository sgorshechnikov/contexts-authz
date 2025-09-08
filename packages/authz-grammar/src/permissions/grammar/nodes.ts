import {CstNode, IToken} from 'chevrotain';

export interface AuthzRulesNode {
  typeDefinition: CstNode[];
}

export interface TypeDefinitionNode {
  typeName: IToken[];

  relations?: CstNode[];
  permissions?: CstNode[];
}

export interface RelationNode {
  relationName: IToken[];

  relationExpression: CstNode[];
}

export interface RelationExpressionNode {
  lhs: IToken[];
  relationRelationalOperator: CstNode[];
  rhs: CstNode[];
}

export interface TypeReferenceNode {
  typeName: IToken[];
}

export interface PermissionNode {
  permissionName: IToken[];

  permissionExpression: CstNode[];
}

export interface PermissionExpressionNode {
  lhs: CstNode[];
  permissionRelationalOperator: CstNode[];
  rhs: CstNode[];
}

export interface RelationReferenceNode {
  relationName: IToken[];
  nestedRelationName?: IToken[]

  childPermission?: IToken[];
}

export interface RelationRelationalOperatorNode {
  Pipe?: IToken[];
}

export interface PermissionRelationalOperatorNode {
  Plus?: IToken[];
}