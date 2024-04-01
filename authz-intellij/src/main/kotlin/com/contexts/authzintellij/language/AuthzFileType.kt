package com.contexts.authzintellij.language

import com.intellij.openapi.fileTypes.LanguageFileType
import javax.swing.Icon


class AuthzFileType : LanguageFileType(AuthzLanguage.INSTANCE) {
    override fun getName(): String {
        return "Contexts Authz"
    }

    override fun getDescription(): String {
        return "Contexts Authz permissions schema file"
    }

    override fun getDefaultExtension(): String {
        return "authz"
    }

    override fun getIcon(): Icon {
        return AuthzIcons.FILE
    }

    companion object {
        val INSTANCE: AuthzFileType = AuthzFileType()
    }
}