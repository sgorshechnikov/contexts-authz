package com.contexts.authzintellij.language.psi

import com.contexts.authzintellij.language.AuthzFileType
import com.intellij.openapi.project.Project
import com.intellij.psi.PsiFileFactory

object AuthzElementFactory {
    fun <E : AuthzNamedElement> createProperty(project: Project, name: String): E {
        val file: AuthzFile = createFile(project, name)
        return file.firstChild as E
    }

    fun createFile(project: Project, text: String): AuthzFile {
        val name = "dummy.authz"
        return PsiFileFactory.getInstance(project).createFileFromText(
            name, AuthzFileType.INSTANCE, text) as AuthzFile
    }
}