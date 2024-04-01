package com.contexts.authzintellij.language

import com.contexts.authzintellij.language.psi.AuthzTypes
import com.intellij.lexer.Lexer
import com.intellij.openapi.editor.DefaultLanguageHighlighterColors
import com.intellij.openapi.editor.HighlighterColors
import com.intellij.openapi.editor.colors.TextAttributesKey
import com.intellij.openapi.editor.colors.TextAttributesKey.createTextAttributesKey
import com.intellij.openapi.fileTypes.SyntaxHighlighterBase
import com.intellij.psi.TokenType
import com.intellij.psi.tree.IElementType


class AuthzSyntaxHighlighter : SyntaxHighlighterBase() {
    override fun getHighlightingLexer(): Lexer {
        return AuthzLexerAdapter()
    }

    override fun getTokenHighlights(tokenType: IElementType): Array<TextAttributesKey?> {
        if (tokenType.equals(AuthzTypes.DEFINITION)) {
            return DEFINITION_KEYS
        }
        if (tokenType.equals(AuthzTypes.RELATION)) {
            return RELATION_KEYS
        }
        if (tokenType.equals(AuthzTypes.RELATION_NAME)) {
            return RELATION_NAME_KEYS
        }
        if (tokenType.equals(AuthzTypes.PERMISSION)) {
            return PERMISSION_KEYS
        }
        if (tokenType.equals(AuthzTypes.PERMISSION_NAME)) {
            return PERMISSION_NAME_KEYS
        }
        if (tokenType.equals(AuthzTypes.COMMENT)) {
            return COMMENT_KEYS
        }
        if (tokenType.equals(TokenType.BAD_CHARACTER)) {
            return BAD_CHAR_KEYS
        }
        return EMPTY_KEYS
    }

    companion object {
        private val DEFINITION: TextAttributesKey =
            createTextAttributesKey("AUTHZ_DEFINITION", DefaultLanguageHighlighterColors.KEYWORD)

        private val RELATION: TextAttributesKey =
            createTextAttributesKey("AUTHZ_RELATION", DefaultLanguageHighlighterColors.KEYWORD)
        private val RELATION_NAME: TextAttributesKey =
            createTextAttributesKey("AUTHZ_RELATION_NAME", DefaultLanguageHighlighterColors.CONSTANT)

        private val PERMISSION: TextAttributesKey =
            createTextAttributesKey("AUTHZ_PERMISSION", DefaultLanguageHighlighterColors.KEYWORD)
        private val PERMISSION_NAME: TextAttributesKey =
            createTextAttributesKey("AUTHZ_PERMISSION_NAME", DefaultLanguageHighlighterColors.FUNCTION_DECLARATION)

        private val COMMENT: TextAttributesKey =
            createTextAttributesKey("AUTHZ_COMMENT", DefaultLanguageHighlighterColors.LINE_COMMENT)
        private val BAD_CHARACTER: TextAttributesKey =
            createTextAttributesKey("AUTHZ_BAD_CHARACTER", HighlighterColors.BAD_CHARACTER)


        private val BAD_CHAR_KEYS = arrayOf<TextAttributesKey?>(BAD_CHARACTER)
        private val DEFINITION_KEYS = arrayOf<TextAttributesKey?>(DEFINITION)

        private val RELATION_KEYS = arrayOf<TextAttributesKey?>(RELATION)
        private val RELATION_NAME_KEYS = arrayOf<TextAttributesKey?>(RELATION_NAME)

        private val PERMISSION_KEYS = arrayOf<TextAttributesKey?>(PERMISSION)
        private val PERMISSION_NAME_KEYS = arrayOf<TextAttributesKey?>(PERMISSION_NAME)

        private val COMMENT_KEYS = arrayOf<TextAttributesKey?>(COMMENT)
        private val EMPTY_KEYS = arrayOfNulls<TextAttributesKey>(0)
    }
}