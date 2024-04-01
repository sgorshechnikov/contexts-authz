package com.contexts.authzintellij.language

import com.contexts.authzintellij.language.psi.*
import com.intellij.lang.ASTNode
import com.intellij.openapi.util.TextRange
import com.intellij.psi.PsiComment
import com.intellij.psi.PsiElement
import com.intellij.psi.tree.IElementType
import com.intellij.spellchecker.inspections.CommentSplitter
import com.intellij.spellchecker.inspections.IdentifierSplitter
import com.intellij.spellchecker.tokenizer.SpellcheckingStrategy
import com.intellij.spellchecker.tokenizer.TokenConsumer
import com.intellij.spellchecker.tokenizer.Tokenizer


internal class AuthzSpellcheckingStrategy : SpellcheckingStrategy() {

    override fun getTokenizer(element: PsiElement): Tokenizer<*> {
        if (element is PsiComment) {
            return AuthzCommentTokenizer()
        }

        if (element is AuthzDefinitionNameDef) {
            return AuthzDefinitionNameTokenizer()
        }

        if (element is AuthzRelationType) {
            return AuthzRelationTypeTokenizer()
        }

        if (element is AuthzRelationDefName) {
            return AuthzRelationDefNameTokenizer()
        }

        if (element is AuthzPermissionDefName) {
            return AuthzPermissionDefNameTokenizer()
        }

        if (element is AuthzPermissionReferenceRelationName) {
            return AuthzPermissionReferenceRelationNameTokenizer()
        }

        if (element is AuthzPermissionReferencePermissionName) {
            return AuthzPermissionReferencePermissionNameTokenizer()
        }

        return EMPTY_TOKENIZER
    }

    private class AuthzCommentTokenizer : Tokenizer<PsiComment?>() {
        override fun tokenize(element: PsiComment, consumer: TokenConsumer) {
            // Exclude the start of the comment with its # characters from spell checking
            var startIndex = 0
            for (c in element.textToCharArray()) {
                if (c == '#' || Character.isWhitespace(c)) {
                    startIndex++
                } else {
                    break
                }
            }
            consumer.consumeToken(
                element, element.text, false, 0,
                TextRange.create(startIndex, element.textLength),
                CommentSplitter.getInstance()
            )
        }
    }

    private class AuthzDefinitionNameTokenizer : Tokenizer<AuthzDefinitionNameDef?>() {
        override fun tokenize(element: AuthzDefinitionNameDef, consumer: TokenConsumer) {
            tokenizeType(element.node, consumer, AuthzTypes.IDENTIFIER)
        }
    }

    private class AuthzRelationTypeTokenizer : Tokenizer<AuthzRelationType?>() {
        override fun tokenize(element: AuthzRelationType, consumer: TokenConsumer) {
            tokenizeType(element.node, consumer, AuthzTypes.IDENTIFIER)
        }
    }

    private class AuthzRelationDefNameTokenizer : Tokenizer<AuthzRelationDefName?>() {
        override fun tokenize(element: AuthzRelationDefName, consumer: TokenConsumer) {
            tokenizeType(element.node, consumer, AuthzTypes.RELATION_NAME)
        }
    }

    private class AuthzPermissionReferenceRelationNameTokenizer : Tokenizer<AuthzPermissionReferenceRelationName?>() {
        override fun tokenize(element: AuthzPermissionReferenceRelationName, consumer: TokenConsumer) {
            tokenizeType(element.node, consumer, AuthzTypes.RELATION_NAME)
        }
    }

    private class AuthzPermissionDefNameTokenizer : Tokenizer<AuthzPermissionDefName?>() {
        override fun tokenize(element: AuthzPermissionDefName, consumer: TokenConsumer) {
            tokenizeType(element.node, consumer, AuthzTypes.PERMISSION_NAME)
        }
    }

    private class AuthzPermissionReferencePermissionNameTokenizer : Tokenizer<AuthzPermissionReferencePermissionName?>() {
        override fun tokenize(element: AuthzPermissionReferencePermissionName, consumer: TokenConsumer) {
            tokenizeType(element.node, consumer, AuthzTypes.PERMISSION_NAME)
        }
    }

    companion object {
        private fun tokenizeType(node: ASTNode, consumer: TokenConsumer, type: IElementType) {
            val typeNode: ASTNode? = node.findChildByType(type)
            if (typeNode != null && typeNode.textLength > 0) {
                val keyPsi: PsiElement = typeNode.psi
                val text: String = typeNode.text

                consumer.consumeToken(
                    keyPsi, text, true, 0,
                    TextRange.allOf(text), IdentifierSplitter.getInstance()
                )
            }
        }
    }
}