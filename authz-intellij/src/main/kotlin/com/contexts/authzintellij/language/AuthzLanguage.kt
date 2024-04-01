package com.contexts.authzintellij.language

import com.intellij.lang.Language

class AuthzLanguage() : Language("Authz") {
    companion object {
        val INSTANCE: AuthzLanguage = AuthzLanguage()
    }
}