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

public class AuthzPermissionExpressionImpl extends ASTWrapperPsiElement implements AuthzPermissionExpression {

  public AuthzPermissionExpressionImpl(@NotNull ASTNode node) {
    super(node);
  }

  public void accept(@NotNull AuthzVisitor visitor) {
    visitor.visitPermissionExpression(this);
  }

  @Override
  public void accept(@NotNull PsiElementVisitor visitor) {
    if (visitor instanceof AuthzVisitor) accept((AuthzVisitor)visitor);
    else super.accept(visitor);
  }

  @Override
  @NotNull
  public List<AuthzPermissionExpressionOperator> getPermissionExpressionOperatorList() {
    return PsiTreeUtil.getChildrenOfTypeAsList(this, AuthzPermissionExpressionOperator.class);
  }

  @Override
  @NotNull
  public List<AuthzPermissionReference> getPermissionReferenceList() {
    return PsiTreeUtil.getChildrenOfTypeAsList(this, AuthzPermissionReference.class);
  }

}
