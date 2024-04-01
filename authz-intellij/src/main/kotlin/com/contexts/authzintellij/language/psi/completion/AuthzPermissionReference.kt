package com.contexts.authzintellij.language.psi.completion

import com.contexts.authzintellij.language.AuthzIcons
import com.contexts.authzintellij.language.AuthzUtil
import com.contexts.authzintellij.language.psi.AuthzDefinitionDef
import com.contexts.authzintellij.language.psi.AuthzPermissionDefName
import com.contexts.authzintellij.language.psi.AuthzPermissionReference
import com.contexts.authzintellij.language.psi.AuthzPermissionReferenceRelationName
import com.contexts.authzintellij.language.psi.AuthzRelationDefName
import com.intellij.codeInsight.lookup.LookupElement
import com.intellij.codeInsight.lookup.LookupElementBuilder
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.TextRange
import com.intellij.psi.*
import com.intellij.psi.util.PsiTreeUtil
import com.intellij.psi.util.parentOfType

internal class AuthzPermissionReference(element: PsiElement, textRange: TextRange) :
    PsiReferenceBase<PsiElement?>(element, textRange), PsiPolyVariantReference {
    private val permissionName = element.text.substring(textRange.startOffset, textRange.endOffset)

    override fun multiResolve(incompleteCode: Boolean): Array<out ResolveResult> {
        val currentElement = myElement!!
        val project: Project = currentElement.project
        val permissionReference = currentElement.parentOfType<AuthzPermissionReference>()
        val parentDefinition = currentElement.parentOfType<AuthzDefinitionDef>()

        val results: MutableList<ResolveResult> = ArrayList()

        if (parentDefinition !== null && permissionReference != null) {
            val relationReferenceName = PsiTreeUtil.findChildOfType(permissionReference, AuthzPermissionReferenceRelationName::class.java)?.name

            if (relationReferenceName != null) {
                val relationReference = AuthzUtil.findRelationDefinitions(parentDefinition, relationReferenceName).firstOrNull()
                if (relationReference != null) {
                    val definitions: List<AuthzPermissionDefName> =
                        AuthzUtil.findPermissionDefinitions(project, relationReference, permissionName)
                    for (definition in definitions) {
                        results.add(PsiElementResolveResult(definition))
                    }
                }
            }
        }
        return results.toTypedArray()
    }

    override fun resolve(): PsiElement? {
        val resolveResults: Array<out ResolveResult> = multiResolve(false)
        return if (resolveResults.size == 1) resolveResults[0].element else null
    }

    override fun getVariants(): Array<out Any> {
        val currentElement = myElement!!
        val project: Project = currentElement.project
        val permissionReference = currentElement.parentOfType<AuthzPermissionReference>()
        val parentDefinition = currentElement.parentOfType<AuthzDefinitionDef>()

        val variants: MutableList<LookupElement> = ArrayList()

        if (parentDefinition !== null && permissionReference != null) {
            val relationReferenceName = PsiTreeUtil.findChildOfType(permissionReference, AuthzPermissionReferenceRelationName::class.java)?.name

            if (relationReferenceName != null) {
                val relationReference = AuthzUtil.findRelationDefinitions(parentDefinition, relationReferenceName).firstOrNull()
                if (relationReference != null) {
                    val definitions: List<AuthzPermissionDefName> =
                        AuthzUtil.findPermissionDefinitions(project, relationReference)
                    for (definition in definitions) {
                        if (!definition.name.isNullOrBlank()) {
                            variants.add(
                                LookupElementBuilder
                                    .create(definition).withIcon(AuthzIcons.FILE)
                                    .withTypeText(definition.containingFile.name)
                            )
                        }
                    }
                }
            }
        }
        return variants.toTypedArray()
    }
}