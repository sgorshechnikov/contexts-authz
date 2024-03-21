import {ObjectDefinition} from "./authz-types";

export type Paginated = {
  cursor: string
}

export type ResourceRelations<R> = Paginated & {
  resource: ObjectDefinition<unknown, R>,
  relations: {
    object: ObjectDefinition<unknown, unknown>,
    relation: R,
  }[]
}

export interface Authz {
  principalHasPermission<P>(principal: ObjectDefinition<P, unknown>, resource: ObjectDefinition<unknown, unknown>, permission: P): Promise<boolean>;

  getRelationForPrincipal<R>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, R>): Promise<R | undefined>;

  getPermissions<P>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<P, unknown>): Promise<P[]>;

  getRelations<R>(resource: ObjectDefinition<unknown, R>, first: number, after: string): Promise<ResourceRelations<R>>;

  addRelation<R>(principal: ObjectDefinition<unknown, unknown>, resource: ObjectDefinition<unknown, R>, relation: R): Promise<void>;
}