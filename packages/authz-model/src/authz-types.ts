// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ObjectDefinition<Permission = void, Relation = void> {
  id: string;
  __typename: string;
}

export type WithCursor<T> = T & {
  cursor: string
}

export type Paginated<T> = T & {
  cursor?: string
}

export type ObjectsRelation<R> = {
  source: ObjectDefinition<unknown, unknown>,
  target: ObjectDefinition<unknown, R>,
  relation: R,
}

export type ObjectRelation<R> = {
  object: ObjectDefinition<unknown, R>,
  relation: R,
}

export type ObjectRelations<R> = Paginated<{
  resource: ObjectDefinition<unknown, R>,
  relations: WithCursor<ObjectRelation<R>>[]
}>

export type ObjectPermissions<P> = {
  resource: ObjectDefinition<P, unknown>,
  permissions: P[],
}

export type PrincipalPermissions<P> = Paginated<{
  principal: ObjectDefinition<P, unknown>,
  permissions: WithCursor<ObjectPermissions<P>>[]
}>