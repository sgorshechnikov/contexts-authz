// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ObjectDefinition<Permission = void, Relation = void> {
  id: string;
  __typename: string;
}

export type Paginated = {
  cursor: string
}

export type ObjectRelations<R> = Paginated & {
  resource: ObjectDefinition<unknown, R>,
  relations: {
    object: ObjectDefinition<unknown, unknown>,
    relation: R,
  }[]
}