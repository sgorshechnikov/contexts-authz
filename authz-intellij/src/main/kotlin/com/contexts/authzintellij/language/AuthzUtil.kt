package com.contexts.authzintellij.language

import com.contexts.authzintellij.language.psi.*
import com.intellij.openapi.project.Project
import com.intellij.psi.PsiManager
import com.intellij.psi.search.FileTypeIndex
import com.intellij.psi.search.GlobalSearchScope
import com.intellij.psi.util.PsiTreeUtil
import com.intellij.psi.util.parentOfType
import java.util.*


object AuthzUtil {
    fun findDefinitions(project: Project, key: String): List<AuthzDefinitionNameDef> {
        val result: MutableList<AuthzDefinitionNameDef> = ArrayList<AuthzDefinitionNameDef>()
        val virtualFiles =
            FileTypeIndex.getFiles(AuthzFileType.INSTANCE, GlobalSearchScope.allScope(project))
        for (virtualFile in virtualFiles) {
            val simpleFile: AuthzFile = PsiManager.getInstance(project).findFile(virtualFile) as AuthzFile
            val definitions: Array<AuthzDefinitionDef> = PsiTreeUtil.getChildrenOfType(
                simpleFile,
                AuthzDefinitionDef::class.java
            ) ?: emptyArray()

            for (definition in definitions) {
                val definitionName = PsiTreeUtil.findChildOfType(definition, AuthzDefinitionNameDef::class.java, true)

                if (definitionName?.name?.startsWith(key) == true) {
                    result.add(definitionName)
                }
            }
        }
        return result
    }

    fun findDefinitions(project: Project): List<AuthzDefinitionNameDef> {
        val result: MutableList<AuthzDefinitionNameDef> = ArrayList<AuthzDefinitionNameDef>()
        val virtualFiles =
            FileTypeIndex.getFiles(AuthzFileType.INSTANCE, GlobalSearchScope.allScope(project))
        for (virtualFile in virtualFiles) {
            val simpleFile: AuthzFile? = PsiManager.getInstance(project).findFile(virtualFile!!) as AuthzFile?
            if (simpleFile != null) {
                val definitions: Array<AuthzDefinitionDef> = PsiTreeUtil.getChildrenOfType(
                    simpleFile,
                    AuthzDefinitionDef::class.java
                ) ?: emptyArray()

                for (definition in definitions) {
                    val definitionName =
                        PsiTreeUtil.findChildOfType(definition, AuthzDefinitionNameDef::class.java, true)

                    if (definitionName != null && !definitionName.name.isNullOrBlank()) {
                        result.add(definitionName)
                    }
                }
            }
        }
        return result
    }

    fun findRelationDefinitions(parentDefinition: AuthzDefinitionDef, key: String): List<AuthzRelationDefName> {
        val result: MutableList<AuthzRelationDefName> = ArrayList<AuthzRelationDefName>()

        val definitionNames = PsiTreeUtil.findChildrenOfType(parentDefinition, AuthzRelationDefName::class.java)

        for (definitionName in definitionNames) {
            if (definitionName.name?.startsWith(key) == true) {
                result.add(definitionName)
            }
        }
        return result
    }

    fun findRelationDefinitions(parentDefinition: AuthzDefinitionDef): List<AuthzRelationDefName> {
        val result: MutableList<AuthzRelationDefName> = ArrayList<AuthzRelationDefName>()

        val definitionNames = PsiTreeUtil.findChildrenOfType(parentDefinition, AuthzRelationDefName::class.java)

        for (definitionName in definitionNames) {
            result.add(definitionName)
        }

        return result
    }

    fun findPermissionDefinitions(
        project: Project,
        relationDefinitionName: AuthzRelationDefName,
        permissionName: String
    ): List<AuthzPermissionDefName> {
        val result: MutableList<AuthzPermissionDefName> = ArrayList<AuthzPermissionDefName>()

        val relationDefinition = relationDefinitionName.parentOfType<AuthzRelationDef>()
        if (relationDefinition != null) {
            val relationTypes = PsiTreeUtil.findChildrenOfType(relationDefinition, AuthzRelationType::class.java)
            for (relationType in relationTypes) {
                val definitionsNames = findDefinitions(project)
                for (definitionName in definitionsNames) {
                    val definition = definitionName.parentOfType<AuthzDefinitionDef>()
                    if (definition != null && definitionName.name != null && definitionName.name == relationType.name) {
                        val permissionDefNames =
                            PsiTreeUtil.findChildrenOfType(definition, AuthzPermissionDefName::class.java)
                        for (permissionDefName in permissionDefNames) {
                            if (permissionDefName.name?.startsWith(permissionName) == true) {
                                result.add(permissionDefName)
                            }
                        }
                    }
                }
            }
        }

        return result
    }

    fun findPermissionDefinitions(
        project: Project,
        relationDefinitionName: AuthzRelationDefName,
    ): List<AuthzPermissionDefName> {
        val result: MutableList<AuthzPermissionDefName> = ArrayList<AuthzPermissionDefName>()

        val relationDefinition = relationDefinitionName.parentOfType<AuthzRelationDef>()
        if (relationDefinition != null) {
            val relationTypes = PsiTreeUtil.findChildrenOfType(relationDefinition, AuthzRelationType::class.java)
            for (relationType in relationTypes) {
                val definitionsNames = findDefinitions(project)
                for (definitionName in definitionsNames) {
                    val definition = definitionName.parentOfType<AuthzDefinitionDef>()
                    if (definition != null && definitionName.name != null && definitionName.name == relationType.name) {
                        val permissionDefNames =
                            PsiTreeUtil.findChildrenOfType(definition, AuthzPermissionDefName::class.java)
                        for (permissionDefName in permissionDefNames) {
                            result.add(permissionDefName)
                        }
                    }
                }
            }
        }

        return result
    }
}