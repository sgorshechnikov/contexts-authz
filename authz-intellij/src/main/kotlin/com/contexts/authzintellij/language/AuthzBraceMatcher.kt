package com.contexts.authzintellij.language

import com.contexts.authzintellij.language.psi.AuthzTypes
import com.intellij.lang.BracePair
import com.intellij.lang.PairedBraceMatcher
import com.intellij.psi.PsiFile
import com.intellij.psi.tree.IElementType

class AuthzBraceMatcher : PairedBraceMatcher {
    override fun getPairs(): Array<BracePair> {
        return arrayOf(
            BracePair(AuthzTypes.L_CURLY, AuthzTypes.R_CURLY, true),
        )
    }

    override fun isPairedBracesAllowedBeforeType(p0: IElementType, p1: IElementType?): Boolean {
        return true
    }

    override fun getCodeConstructStart(p0: PsiFile?, p1: Int): Int {
        return p1
    }

}