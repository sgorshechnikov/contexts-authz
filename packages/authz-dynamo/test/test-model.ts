import {ObjectDefinition} from '@contexts-authz/authz-model';



export class User implements ObjectDefinition {
  constructor(readonly id: string) {}

  __typename = "user";

}



export class Org implements ObjectDefinition<Org.Permission, Org.Relation> {
  constructor(readonly id: string) {}

  __typename = "org";

}



export namespace Org {
  export enum Permission {
    Administer = "administer",
  }

  export enum Relation {
    Administrator = "administrator",
  }

}



export class Workspace implements ObjectDefinition<Workspace.Permission, Workspace.Relation> {
  constructor(readonly id: string) {}

  __typename = "workspace";

}



export namespace Workspace {
  export enum Permission {
    Administer = "administer",
    Edit = "edit",
    View = "view",
  }

  export enum Relation {
    Owner = "owner",
    Administrator = "administrator",
    Member = "member",
    Guest = "guest",
  }

}



export class Document implements ObjectDefinition<Document.Permission, Document.Relation> {
  constructor(readonly id: string) {}

  __typename = "document";

}



export namespace Document {
  export enum Permission {
    Delete = "delete",
    Edit = "edit",
    View = "view",
    Administer = "administer",
  }

  export enum Relation {
    Owner = "owner",
    Member = "member",
    Guest = "guest",
  }

}