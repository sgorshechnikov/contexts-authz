import {ObjectDefinition, ObjectRelation, ObjectRelations, ObjectsRelation, ObjectPermissions} from "./authz-types";

export interface Authz {
  principalHasPermission<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>, permission: P): Promise<boolean>;

  getRelation<R>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, R>): Promise<R | undefined>

  getRelationsForPrincipal(principal: ObjectDefinition<unknown, unknown>, resourceType: string, first: number, after?: string): Promise<ObjectRelations<unknown>>

  getPrincipalRelationsForEntities<R>(principal: ObjectDefinition<unknown, unknown>, resources: ObjectDefinition<unknown, R>[]): Promise<ObjectRelation<R>[]>;

  getPermissions<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>, requestedPermissions?: P[]): Promise<P[]>;

  getPrincipalPermissionsForEntities<P, R>(
      principal: ObjectDefinition<unknown, unknown>,
      resources: ObjectDefinition<P, R>[],
      transitiveResources: {
        source: ObjectDefinition<unknown, unknown>,
        relation: R,
      }[],
      requestedPermissions: P[]
  ): Promise<ObjectPermissions<P>[]>;

  getRelations<R>(resource: ObjectDefinition<unknown, R>, first: number, principalType?: string, after?: string): Promise<ObjectRelations<R>>;

  addRelations<R>(relations: ObjectsRelation<R>[]): Promise<void>;

  removeRelations(relations: {principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, unknown>}[]): Promise<void>;

  removeAllObjectRelations(object: ObjectDefinition<unknown, unknown>): Promise<void>;
}