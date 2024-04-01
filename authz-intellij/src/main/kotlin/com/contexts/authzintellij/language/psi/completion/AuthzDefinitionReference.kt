package com.contexts.authzintellij.language.psi.completion

import com.contexts.authzintellij.language.AuthzIcons
import com.contexts.authzintellij.language.AuthzUtil
import com.contexts.authzintellij.language.psi.AuthzDefinitionDef
import com.contexts.authzintellij.language.psi.AuthzDefinitionNameDef
import com.intellij.codeInsight.lookup.LookupElement
import com.intellij.codeInsight.lookup.LookupElementBuilder
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.TextRange
import com.intellij.psi.*


internal class AuthzDefinitionReference(element: PsiElement, textRange: TextRange) :
    PsiReferenceBase<PsiElement?>(element, textRange), PsiPolyVariantReference {
    private val definitionName = element.text.substring(textRange.startOffset, textRange.endOffset)

    override fun multiResolve(incompleteCode: Boolean): Array<out ResolveResult> {
        val project: Project = myElement!!.project
        val definitions: List<AuthzDefinitionNameDef> = AuthzUtil.findDefinitions(project, definitionName)
        val results: MutableList<ResolveResult> = ArrayList()
        for (definition in definitions) {
            results.add(PsiElementResolveResult(definition))
        }
        return results.toTypedArray()
    }

    override fun resolve(): PsiElement? {
        val resolveResults: Array<out ResolveResult> = multiResolve(false)
        return if (resolveResults.size == 1) resolveResults[0].element else null
    }

    override fun getVariants(): Array<out Any> {
        val project: Project = myElement!!.project
        val properties: List<AuthzDefinitionNameDef> = AuthzUtil.findDefinitions(project)
        val variants: MutableList<LookupElement> = ArrayList()
        for (property in properties) {
            if (!property.name.isNullOrBlank()) {
                variants.add(
                    LookupElementBuilder
                        .create(property).withIcon(AuthzIcons.FILE)
                        .withTypeText(property.containingFile.name)
                )
            }
        }
        return variants.toTypedArray()
    }
}