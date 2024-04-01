package com.contexts.authzintellij.language.psi

import com.intellij.psi.tree.TokenSet


interface AuthzTokenSets {
    companion object {
//        val IDENTIFIERS: TokenSet = TokenSet.create(AuthzTypes.KEY)

        val COMMENTS: TokenSet = TokenSet.create(AuthzTypes.COMMENT)
    }
}