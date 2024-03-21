import {applicableRelations} from "../src/util";
import {ModelType, RelationExpression, RelationRelationalOperator, TypeDefinition} from "@contexts-authz/authz-grammar";

describe('applicableRelations', () => {
  test('should correctly filter applicable relations for entity', () => {
    const expression: RelationExpression = {
      type: ModelType.RelationExpression,
      lhs: {type: ModelType.TypeReference, name: 'org'},
      relationalOperator: RelationRelationalOperator["|"],
      rhs: {
        type: ModelType.RelationExpression,
        lhs: {type: ModelType.TypeReference, name: 'user'},
        relationalOperator: RelationRelationalOperator["|"],
      }
    }

    const typeDefinition: TypeDefinition = {
      type: ModelType.Definition,
      name: 'workspace',
      relations: [{
        type: ModelType.Relation,
        name: 'member',
        relationExpression: [expression]
      }, {
        type: ModelType.Relation,
        name: 'owner',
        relationExpression: [{
          type: ModelType.RelationExpression,
          lhs: {type: ModelType.TypeReference, name: 'user'},
          relationalOperator: RelationRelationalOperator["|"],
        }]
      }],
      permissions: []
    }

    expect(applicableRelations('user', typeDefinition)).toEqual(['member', 'owner'])
    expect(applicableRelations('org', typeDefinition)).toEqual(['member'])
  })

  test('should return empty result when there is no applicable relations', () => {
    const expression: RelationExpression = {
      type: ModelType.RelationExpression,
      lhs: {type: ModelType.TypeReference, name: 'user'},
      relationalOperator: RelationRelationalOperator["|"],
    }

    const typeDefinition: TypeDefinition = {
      type: ModelType.Definition,
      name: 'workspace',
      relations: [{
        type: ModelType.Relation,
        name: 'member',
        relationExpression: [expression]
      }],
      permissions: []
    }

    const applicable = applicableRelations('org', typeDefinition)
    expect(applicable).toEqual([])
  })
})