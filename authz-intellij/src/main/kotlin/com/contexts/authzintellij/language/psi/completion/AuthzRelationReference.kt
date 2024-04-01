package com.contexts.authzintellij.language.psi.completion

import com.contexts.authzintellij.language.AuthzIcons
import com.contexts.authzintellij.language.AuthzUtil
import com.contexts.authzintellij.language.psi.AuthzDefinitionDef
import com.contexts.authzintellij.language.psi.AuthzRelationDefName
import com.intellij.codeInsight.lookup.LookupElement
import com.intellij.codeInsight.lookup.LookupElementBuilder
import com.intellij.openapi.util.TextRange
import com.intellij.psi.*
import com.intellij.psi.util.parentOfType

internal class AuthzRelationReference(element: PsiElement, textRange: TextRange) :
    PsiReferenceBase<PsiElement?>(element, textRange), PsiPolyVariantReference {
    private val relationName = element.text.substring(textRange.startOffset, textRange.endOffset)

    override fun multiResolve(incompleteCode: Boolean): Array<out ResolveResult> {
        val parentDefinition = myElement!!.parentOfType<AuthzDefinitionDef>()
        val results: MutableList<ResolveResult> = ArrayList()
        if (parentDefinition != null) {
            val definitions: List<AuthzRelationDefName> = AuthzUtil.findRelationDefinitions(parentDefinition, relationName)
            for (definition in definitions) {
                results.add(PsiElementResolveResult(definition))
            }
        }
        return results.toTypedArray()
    }

    override fun resolve(): PsiElement? {
        val resolveResults: Array<out ResolveResult> = multiResolve(false)
        return if (resolveResults.size == 1) resolveResults[0].element else null
    }

    override fun getVariants(): Array<out Any> {
        val parentDefinition = myElement!!.parentOfType<AuthzDefinitionDef>()
        val variants: MutableList<LookupElement> = ArrayList()

        if (parentDefinition != null) {
            val relationDefinitions: List<AuthzRelationDefName> = AuthzUtil.findRelationDefinitions(parentDefinition)
            for (relationDefinition in relationDefinitions) {
                if (!relationDefinition.name.isNullOrBlank()) {
                    variants.add(
                        LookupElementBuilder
                            .create(relationDefinition).withIcon(AuthzIcons.FILE)
                            .withTypeText(relationDefinition.containingFile.name)
                    )
                }
            }
        }
        return variants.toTypedArray()
    }
}