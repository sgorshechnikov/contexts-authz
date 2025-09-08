import {createToken, Lexer} from 'chevrotain';

export const Identifier = createToken({name: 'Identifier', pattern: /[a-zA-Z]\w*/});

export const PermissionQuoted = createToken({
  name: "PermissionQuoted",
  // examples matched: "write", "write:groups.role-assignments", "read:group-1.sub-sec"
  // Explanation:
  //  - "([A-Za-z][A-Za-z0-9_-]*)"    => initial name (starts with letter)
  //  - "( : [A-Za-z0-9][A-Za-z0-9-]* (?: \. [A-Za-z0-9][A-Za-z0-9-]* )* )?" =>
  //      optional colon followed by one or more dot-separated segments;
  //      each segment starts with an alnum and may contain dashes (but not dots or underscores at start).
  pattern: /"([A-Za-z][A-Za-z0-9_-]*)(:[A-Za-z0-9][A-Za-z0-9_-]*(?:\.[A-Za-z0-9][A-Za-z0-9_-]*)*)?"/,
});

// We specify the "longer_alt" property to resolve keywords vs identifiers ambiguity.
// See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
export const Definition = createToken({
  name: 'Definition',
  pattern: /definition/i,
  longer_alt: Identifier,
});

export const Relation = createToken({
  name: 'Relation',
  pattern: /relation/i,
  longer_alt: Identifier,
});

export const Permission = createToken({
  name: 'Permission',
  pattern: /permission/i,
  longer_alt: Identifier,
});

export const LCurly = createToken({ name: "LCurly", pattern: /{/ });
export const RCurly = createToken({ name: "RCurly", pattern: /}/ });

export const Colon = createToken({name: 'Colon', pattern: /:/});
export const Equals = createToken({name: 'Equals', pattern: /=/});

export const Plus = createToken({name: 'Plus', pattern: /\+/});
export const Minus = createToken({name: 'Minus', pattern: /-/});
export const Ampersand = createToken({name: 'Ampersand', pattern: /&/});
export const Pipe = createToken({name: 'Pipe', pattern: /\|/});
export const Dot = createToken({name: 'Dot', pattern: /\./});
export const Arrow = createToken({name: 'Arrow', pattern: /->/});

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// note we are placing WhiteSpace first as it is very common thus it will speed up the lexer.
export const authzTokens = [
  WhiteSpace,

  // "keywords" appear before the Identifier
  Definition,
  Relation,
  Permission,

  PermissionQuoted,

  // The Identifier must appear after the keywords because all keywords are valid identifiers.
  Identifier,
  LCurly,
  RCurly,
  Colon,
  Equals,
  Arrow,
  Plus,
  Minus,
  Ampersand,
  Pipe,
  Dot,
];

export const AuthzLexer = new Lexer(authzTokens);

export function tokenize(text: string) {
  const result = AuthzLexer.tokenize(text);

  if (result.errors.length > 0) {
    const msg = result.errors.map((error) => `[${error.line}:${error.column}] ${error.message}`).join(', ');
    throw new Error(`Error tokenizing the text. ${msg}`);
  }

  return result.tokens;
}