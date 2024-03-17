import {CstNode, CstParser} from "chevrotain";
import {
  authzTokens,
  Colon,
  Definition, Dot, Equals,
  Identifier,
  LCurly,
  Permission,
  Pipe, Plus,
  RCurly,
  Relation,
  tokenize
} from "./lexer";

export class AuthZParser extends CstParser {
  constructor() {
    super(authzTokens, {
      recoveryEnabled: true,
    });
    this.performSelfAnalysis();
  }

  authzParser = this.RULE('authzRules', () => {
    this.MANY(() => {
      this.SUBRULE(this.definition);
    });
  });

  private definition = this.RULE('typeDefinition', () => {
    this.CONSUME(Definition);
    this.CONSUME(Identifier, {LABEL: 'typeName'});
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.OR([
        {ALT: () => this.SUBRULE(this.relation)},
        {ALT: () => this.SUBRULE(this.permission)},
      ])
    });
    this.CONSUME(RCurly);
  })

  private relation = this.RULE('relations', () => {
    this.CONSUME(Relation);
    this.CONSUME(Identifier, {LABEL: 'relationName'});
    this.CONSUME(Colon);
    this.SUBRULE(this.relationExpression);
  });

  private relationExpression = this.RULE('relationExpression', () => {
    this.CONSUME(Identifier, {LABEL: 'lhs'});
    this.OPTION(() => {
      this.SUBRULE(this.relationRelationalOperator);
      this.SUBRULE(this.relationExpression, {LABEL: 'rhs'})
    })
  });

  private relationRelationalOperator = this.RULE('relationRelationalOperator', () => {
    this.OR([
      {ALT: () => this.CONSUME(Pipe)}
    ])
  })

  private permission = this.RULE('permissions', () => {
    this.CONSUME(Permission);
    this.CONSUME(Identifier, {LABEL: 'permissionName'});
    this.CONSUME(Equals);
    this.SUBRULE(this.permissionExpression);
  });

  private permissionExpression = this.RULE('permissionExpression', () => {
    this.SUBRULE(this.relationReference, {LABEL: 'lhs'});
    this.OPTION(() => {
      this.SUBRULE(this.permissionRelationalOperator);
      this.SUBRULE(this.permissionExpression, {LABEL: 'rhs'});
    });
  });

  private relationReference = this.RULE('relationReference', () => {
    this.CONSUME(Identifier, {LABEL: 'relationName'});
    this.OPTION(() => {
      this.CONSUME(Dot);
      this.CONSUME2(Identifier, {LABEL: 'childPermission'})
    });
  })

  private permissionRelationalOperator = this.RULE('permissionRelationalOperator', () => {
    this.OR([
      {ALT: () => this.CONSUME(Plus)}
    ]);
  })
}

export const parser: AuthZParser = new AuthZParser();
export function parse(text: string): CstNode {
  parser.input = tokenize(text);
  const cst = parser.authzParser();

  if (parser.errors.length > 0) {
    const msg = parser.errors.map((error) => `[${error.name}] ${error.message}`).join(', ');
    throw new Error(msg);
  }

  return cst;
}