package com.contexts.authzintellij.language;

import com.contexts.authzintellij.language.psi.AuthzTypes;
import com.intellij.lexer.FlexLexer;
import com.intellij.psi.tree.IElementType;
import io.ktor.client.plugins.auth.Auth;
import com.intellij.psi.TokenType;

%%

%class AuthzLexer
%implements FlexLexer
%unicode
%function advance
%type IElementType
%eof{  return;
%eof}

NEW_LINE=[\r\n]
SPACE=[\ \t]
WHITE_SPACE=[\ \n\t\f]
END_OF_LINE_COMMENT=("#")[^\r\n]*

// Operators
L_CURLY="{"
R_CURLY="}"
DOT="."
COLON=":"
EQUALS="="
PLUS="+"
PIPE="|"

// Keywords
DEFINITION="definition"
RELATION="relation"
PERMISSION="permission"

IDENTIFIER=[a-zA-Z_][a-zA-Z0-9_]*

RELATION_NAME=[a-zA-Z_][a-zA-Z0-9_]*

PERMISSION_NAME=[a-zA-Z_][a-zA-Z0-9_]*

%state RELATION_DEFINITION
%state PERMISSION_DEFINITION
%state RELATION_REFERENCE
%state RELATION_PERMISSION_REFERENCE

%%

<YYINITIAL> {
    {END_OF_LINE_COMMENT}                           { return AuthzTypes.COMMENT; }
    {WHITE_SPACE}+                                  { return TokenType.WHITE_SPACE; }

    // Operators
    "{"                                             { return AuthzTypes.L_CURLY; }
    "}"                                             { return AuthzTypes.R_CURLY; }
    "."                                             { return AuthzTypes.DOT; }
    ":"                                             { return AuthzTypes.COLON; }
    "="                                             { return AuthzTypes.EQUALS; }
    "+"                                             { return AuthzTypes.PLUS; }
    "|"                                             { return AuthzTypes.PIPE; }

    // Keywords
    {DEFINITION}                                    { return AuthzTypes.DEFINITION; }
    "relation"                                      { yybegin(RELATION_DEFINITION); return AuthzTypes.RELATION; }
    "permission"                                    { yybegin(PERMISSION_DEFINITION); return AuthzTypes.PERMISSION; }

    {IDENTIFIER}                                    { return AuthzTypes.IDENTIFIER; }
}

<RELATION_DEFINITION> {
    {SPACE}+                                        { return TokenType.WHITE_SPACE; }
    {RELATION_NAME}                                 { yybegin(YYINITIAL); return AuthzTypes.RELATION_NAME; }
    {COLON}                                         { return AuthzTypes.COLON; }
}

<PERMISSION_DEFINITION> {
    {SPACE}+                                        { return TokenType.WHITE_SPACE; }
    {PERMISSION_NAME}                               { yybegin(PERMISSION_DEFINITION); return AuthzTypes.PERMISSION_NAME; }
    {EQUALS}                                        { yybegin(RELATION_REFERENCE); return AuthzTypes.EQUALS; }
}

<RELATION_REFERENCE> {
    {NEW_LINE}                                      { yybegin(YYINITIAL); return TokenType.WHITE_SPACE; }
    {SPACE}+                                        { return TokenType.WHITE_SPACE; }
    {RELATION_NAME}                                 { yybegin(RELATION_REFERENCE); return AuthzTypes.RELATION_NAME; }
    {DOT}                                           { yybegin(RELATION_PERMISSION_REFERENCE); return AuthzTypes.DOT; }
    {PLUS}                                          { return AuthzTypes.PLUS; }
}

<RELATION_PERMISSION_REFERENCE> {
    {NEW_LINE}                                      { yybegin(YYINITIAL); return TokenType.WHITE_SPACE; }
    {SPACE}+                                        { yybegin(RELATION_REFERENCE); return TokenType.WHITE_SPACE; }
    {PERMISSION_NAME}                               { yybegin(RELATION_REFERENCE); return AuthzTypes.PERMISSION_NAME; }
}

[^]                                                 { return TokenType.BAD_CHARACTER; }