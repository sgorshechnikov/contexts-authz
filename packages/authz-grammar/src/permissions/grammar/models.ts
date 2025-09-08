export enum ModelType {
  AuthzModel = 'authz_model',
  Definition = 'definition',
  TypeReference = 'type_reference',
  RelationReference = 'relation_reference',
  Relation = 'relation',
  Permission = 'permission',
  RelationExpression = 'relation_expression',
  PermissionExpression = 'permission_expression',
}

export interface Model {
  type: ModelType;
}

export interface AuthzModel extends Model {
  type: ModelType.AuthzModel
  definitions: Array<TypeDefinition>;
}

export interface TypeDefinition extends Model {
  type: ModelType.Definition
  name: string;

  relations: Array<Relation>;
  permissions: Array<Permission>;
}

export interface Relation extends Model {
  type: ModelType.Relation
  name: string;

  relationExpression: Array<RelationExpression>;
}

export interface RelationExpression extends Model {
  type: ModelType.RelationExpression
  lhs: TypeReference;
  relationalOperator: RelationRelationalOperator;
  rhs?: RelationExpression;
}

export interface TypeReference extends Model {
  type: ModelType.TypeReference
  name: string;
}

export interface Permission extends Model {
  type: ModelType.Permission
  name: string;

  permissionExpression: PermissionExpression[];
}

export interface PermissionExpression extends Model {
  type: ModelType.PermissionExpression
  lhs: RelationReference;
  relationalOperator: PermissionRelationalOperator;
  rhs?: PermissionExpression;
}

export interface RelationReference extends Model {
  type: ModelType.RelationReference;
  name: string;
  nestedRelationName?: string[];

  childPermission?: string;
}

export enum PermissionRelationalOperator {
  '+' = '+',
}

export enum RelationRelationalOperator {
  '|' = '|',
}
