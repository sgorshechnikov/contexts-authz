package com.contexts.authzintellij.language.psi

import com.contexts.authzintellij.language.AuthzLanguage
import com.intellij.psi.tree.IElementType

class AuthzTokenType(debugName: String) : IElementType(debugName, AuthzLanguage.INSTANCE) {
    override fun toString(): String {
        return "AuthzTokenType." + super.toString()
    }
}