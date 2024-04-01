package com.contexts.authzintellij.language.psi.impl

import com.contexts.authzintellij.language.psi.AuthzNamedElement
import com.intellij.extapi.psi.ASTWrapperPsiElement
import com.intellij.lang.ASTNode


abstract class AuthzNamedElementImpl(node: ASTNode) : ASTWrapperPsiElement(node), AuthzNamedElement