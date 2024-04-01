package com.contexts.authzintellij.language.psi.completion

import com.contexts.authzintellij.language.psi.AuthzDefinitionBlockItems
import com.contexts.authzintellij.language.psi.AuthzFile
import com.contexts.authzintellij.language.psi.completion.AuthzCompletionPatterns.psiElementWithParent
import com.intellij.codeInsight.completion.*
import com.intellij.patterns.PlatformPatterns.psiElement
import com.intellij.patterns.StandardPatterns
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiErrorElement


internal class AuthzCompletionContributor : CompletionContributor() {
    init {
        extend(
            CompletionType.BASIC,
            psiElementWithParent<AuthzFile>(),
            KeywordCompletionProvider("definition")
        )

        extend(
            CompletionType.BASIC,
            psiElementWithParent<AuthzDefinitionBlockItems>(),
            KeywordCompletionProvider("relation", "permission")
        )
    }
}

object AuthzCompletionPatterns {
    inline fun <reified E : PsiElement> psiElementWithParent() =
        psiElement().withParent(
            StandardPatterns.or(
                psiElement(E::class.java),
                psiElement(PsiErrorElement::class.java).withParent(psiElement(E::class.java))
            )
        )
}