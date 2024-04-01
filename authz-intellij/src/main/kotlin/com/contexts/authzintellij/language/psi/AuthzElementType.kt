package com.contexts.authzintellij.language.psi

import com.contexts.authzintellij.language.AuthzLanguage
import com.intellij.psi.tree.IElementType

class AuthzElementType(debugName: String) : IElementType(debugName, AuthzLanguage.INSTANCE)