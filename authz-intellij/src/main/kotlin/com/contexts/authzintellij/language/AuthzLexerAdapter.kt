package com.contexts.authzintellij.language

import com.intellij.lexer.FlexAdapter


class AuthzLexerAdapter : FlexAdapter(AuthzLexer(null))