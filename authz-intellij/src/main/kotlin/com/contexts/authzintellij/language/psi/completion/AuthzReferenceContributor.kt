package com.contexts.authzintellij.language.psi.completion

import com.contexts.authzintellij.language.psi.AuthzPermissionReferencePermissionName
import com.contexts.authzintellij.language.psi.AuthzPermissionReferenceRelationName
import com.contexts.authzintellij.language.psi.AuthzRelationType
import com.contexts.authzintellij.language.psi.AuthzTypes
import com.intellij.openapi.util.TextRange
import com.intellij.patterns.PlatformPatterns
import com.intellij.psi.*
import com.intellij.util.ProcessingContext

internal class AuthzReferenceContributor : PsiReferenceContributor() {
    override fun registerReferenceProviders(registrar: PsiReferenceRegistrar) {
        registrar.registerReferenceProvider(
            PlatformPatterns.psiElement(AuthzRelationType::class.java),
            object : PsiReferenceProvider() {
                override fun getReferencesByElement(
                    element: PsiElement,
                    context: ProcessingContext
                ): Array<PsiReference> {
                    val definition = element as AuthzRelationType
                    val name = definition.name
                    val nameNode = element.node.findChildByType(AuthzTypes.IDENTIFIER)
                    if (!name.isNullOrBlank() && nameNode != null) {
                        val property = TextRange(nameNode.startOffsetInParent, nameNode.startOffsetInParent + name.length)

                        val r = AuthzDefinitionReference(element, property)
                        return arrayOf(r)
                    }
                    return PsiReference.EMPTY_ARRAY
                }
            })

        registrar.registerReferenceProvider(
            PlatformPatterns.psiElement(AuthzPermissionReferenceRelationName::class.java),
            object : PsiReferenceProvider() {
                override fun getReferencesByElement(
                    element: PsiElement,
                    context: ProcessingContext
                ): Array<PsiReference> {
                    val relationReference = element as AuthzPermissionReferenceRelationName
                    val name = relationReference.name
                    val nameNode = element.node.findChildByType(AuthzTypes.RELATION_NAME)
                    if (!name.isNullOrBlank() && nameNode != null) {
                        val property = TextRange(nameNode.startOffsetInParent, nameNode.startOffsetInParent + name.length)

                        val r = AuthzRelationReference(element, property)
                        return arrayOf(r)
                    }
                    return PsiReference.EMPTY_ARRAY
                }
            })

        registrar.registerReferenceProvider(
            PlatformPatterns.psiElement(AuthzPermissionReferencePermissionName::class.java),
            object : PsiReferenceProvider() {
                override fun getReferencesByElement(
                    element: PsiElement,
                    context: ProcessingContext
                ): Array<PsiReference> {
                    val relationReference = element as AuthzPermissionReferencePermissionName
                    val name = relationReference.name
                    val nameNode = element.node.findChildByType(AuthzTypes.PERMISSION_NAME)
                    if (!name.isNullOrBlank() && nameNode != null) {
                        val property = TextRange(nameNode.startOffsetInParent, nameNode.startOffsetInParent + name.length)

                        val r = AuthzPermissionReference(element, property)
                        return arrayOf(r)
                    }
                    return PsiReference.EMPTY_ARRAY
                }
            })
    }
}