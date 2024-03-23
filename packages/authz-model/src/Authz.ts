import {ObjectDefinition, ObjectRelations} from "./authz-types";

export interface Authz {
  principalHasPermission<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>, permission: P): Promise<boolean>;

  getRelation<R>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, R>): Promise<R>

  getRelationsForPrincipal(principal: ObjectDefinition<unknown, unknown>, resourceType: string, first: number, after?: string): Promise<ObjectRelations<unknown>>

  getPermissions<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>): Promise<P[]>;

  getRelations<R>(resource: ObjectDefinition<unknown, R>, first: number, after?: string): Promise<ObjectRelations<R>>;

  addRelation<R>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, R>, relation: R): Promise<void>;

  removeAllObjectRelations(object: ObjectDefinition<unknown, unknown>): Promise<void>;
}