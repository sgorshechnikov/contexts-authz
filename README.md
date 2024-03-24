![contexts-authz](https://github.com/sgorshechnikov/contexts-authz/actions/workflows/node.js.yml/badge.svg)
![npm](https://img.shields.io/npm/v/@contexts-authz/authz-cli)

# contexts-authz
Zanzibar inspired permission definition and resolution library

## Define your permissions schema

An example schema:

```
definition user {}

definition org {
  relation administrator: user

  permission administer = administrator
}

definition workspace {
  relation owner: org

  relation administrator: user
  relation member: user
  relation guest: user

  permission administer = administrator + owner.admin
  permission edit = administrator + owner.admin + member
  permission view = administrator + owner.admin + member + guest
}

definition document {
  relation owner: user | workspace

  relation member: user
  relation guest: user

  permission delete = owner + owner.admin
  permission edit = owner + owner.admin + member
  permission view = owner + owner.admin + member + guest
}
```

## Generate types for the schema above

### Install the cli

`npm install --save @contexts-authz/authz-cli`

### Create a config file

An example config file:

```typescript
import {AuthzCodegenConfig} from "@contexts-authz/authz-cli/src";

const config: AuthzCodegenConfig = {
  overwrite: true,
  schema: "./src/permissions/permissions.authz",
  generates: {
    "src/__generated/permissions-types.ts": {
    }
  }
};

export default config;
```

### Run the cli to generate types for your schema

`authz-codegen --config authz-codegen.config.ts`

## Use Dynamo implementation to store permissions

### Install the authz-dynamo

`npm install --save @contexts-authz/authz-dynamo`

It expects the following schema for permissions:

`PK` of type String as Hash Key and 
`SK` of type String as Sort Key

Global Secondary Index named `RolesByResource` with `SK` as Hash Key and `PK` as Sort Key and included non-key attribute `Relation`

Example terraform code to create the table:

```hcl
resource "aws_dynamodb_table" "contexts_permissions" {
  name         = "contexts_authz"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key     = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  global_secondary_index {
    name               = "RolesByResource"
    hash_key           = "SK"
    range_key          = "PK"
    projection_type    = "INCLUDE"
    non_key_attributes = ["Relation"]
  }
}
```

### Use the Dynamo implementation

```typescript
import {Authz} from '@contexts-authz/authz-model';
import {User, Workspace} from "./__generated/permissions-types";

const dynamoClient = new DynamoDBClient()
const authz: Authz = new AuthzDynamo(dynamoClient, {
  tableName: 'contexts_authz',
  authzDefinition: readFileSync(`./src/permissions/permissions.authz`, {encoding: 'utf-8'})
})

const canAdminister = await authzDynamo.principalHasPermission(new User('user-id'), new Workspace('workspace-id'), Workspace.Permission.Administer)
```
