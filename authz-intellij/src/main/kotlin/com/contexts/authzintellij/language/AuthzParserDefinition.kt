package com.contexts.authzintellij.language

import com.contexts.authzintellij.language.parser.AuthzParser
import com.contexts.authzintellij.language.psi.AuthzFile
import com.contexts.authzintellij.language.psi.AuthzTokenSets
import com.contexts.authzintellij.language.psi.AuthzTypes
import com.intellij.lang.ParserDefinition
import com.intellij.lang.PsiParser
import com.intellij.psi.FileViewProvider
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiFile
import com.intellij.psi.tree.IFileElementType
import com.intellij.psi.tree.TokenSet
import com.intellij.lang.ASTNode;
import com.intellij.lexer.Lexer;
import com.intellij.openapi.project.Project;


internal class AuthzParserDefinition : ParserDefinition {
    override fun createLexer(project: Project): Lexer {
        return AuthzLexerAdapter()
    }

    override fun getCommentTokens(): TokenSet {
        return AuthzTokenSets.COMMENTS
    }

    override fun getStringLiteralElements(): TokenSet {
        return TokenSet.EMPTY
    }

    override fun createParser(project: Project?): PsiParser {
        return AuthzParser()
    }

    override fun getFileNodeType(): IFileElementType {
        return FILE
    }

    override fun createFile(viewProvider: FileViewProvider): PsiFile {
        return AuthzFile(viewProvider)
    }

    override fun createElement(node: ASTNode?): PsiElement {
        return AuthzTypes.Factory.createElement(node)
    }

    companion object {
        val FILE: IFileElementType = IFileElementType(AuthzLanguage.INSTANCE)
    }
}