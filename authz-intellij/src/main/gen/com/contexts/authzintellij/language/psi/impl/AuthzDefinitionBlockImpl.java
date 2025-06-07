// This is a generated file. Not intended for manual editing.
package com.contexts.authzintellij.language.psi.impl;

import java.util.List;
import org.jetbrains.annotations.*;
import com.intellij.lang.ASTNode;
import com.intellij.psi.PsiElement;
import com.intellij.psi.PsiElementVisitor;
import com.intellij.psi.util.PsiTreeUtil;
import static com.contexts.authzintellij.language.psi.AuthzTypes.*;
import com.intellij.extapi.psi.ASTWrapperPsiElement;
import com.contexts.authzintellij.language.psi.*;

public class AuthzDefinitionBlockImpl extends ASTWrapperPsiElement implements AuthzDefinitionBlock {

  public AuthzDefinitionBlockImpl(@NotNull ASTNode node) {
    super(node);
  }

  public void accept(@NotNull AuthzVisitor visitor) {
    visitor.visitDefinitionBlock(this);
  }

  @Override
  public void accept(@NotNull PsiElementVisitor visitor) {
    if (visitor instanceof AuthzVisitor) accept((AuthzVisitor)visitor);
    else super.accept(visitor);
  }

  @Override
  @NotNull
  public List<AuthzDefinitionBlockItems> getDefinitionBlockItemsList() {
    return PsiTreeUtil.getChildrenOfTypeAsList(this, AuthzDefinitionBlockItems.class);
  }

}
