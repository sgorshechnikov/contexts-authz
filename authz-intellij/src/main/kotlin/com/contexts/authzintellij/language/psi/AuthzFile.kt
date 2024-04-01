package com.contexts.authzintellij.language.psi

import com.contexts.authzintellij.language.AuthzFileType
import com.contexts.authzintellij.language.AuthzLanguage
import com.intellij.extapi.psi.PsiFileBase
import com.intellij.openapi.fileTypes.FileType
import com.intellij.psi.FileViewProvider


class AuthzFile(viewProvider: FileViewProvider) : PsiFileBase(viewProvider, AuthzLanguage.INSTANCE) {
    override fun getFileType(): FileType {
        return AuthzFileType.INSTANCE
    }

    override fun toString(): String {
        return "Authz File"
    }
}