// This is a generated file. Not intended for manual editing.
package com.contexts.authzintellij.language.psi.impl;

import java.util.List;
import org.jetbrains.annotations.*;
import com.intellij.lang.ASTNode;
import com.intellij.psi.PsiElement;
import com.intellij.psi.PsiElementVisitor;
import com.intellij.psi.util.PsiTreeUtil;
import static com.contexts.authzintellij.language.psi.AuthzTypes.*;
import com.contexts.authzintellij.language.psi.*;
import com.intellij.psi.PsiReference;

public class AuthzPermissionReferenceRelationNameImpl extends AuthzNamedElementImpl implements AuthzPermissionReferenceRelationName {

  public AuthzPermissionReferenceRelationNameImpl(@NotNull ASTNode node) {
    super(node);
  }

  public void accept(@NotNull AuthzVisitor visitor) {
    visitor.visitPermissionReferenceRelationName(this);
  }

  @Override
  public void accept(@NotNull PsiElementVisitor visitor) {
    if (visitor instanceof AuthzVisitor) accept((AuthzVisitor)visitor);
    else super.accept(visitor);
  }

  @Override
  @Nullable
  public String getName() {
    return AuthzPsiImplUtil.getName(this);
  }

  @Override
  @NotNull
  public PsiElement setName(@NotNull String newName) {
    return AuthzPsiImplUtil.setName(this, newName);
  }

  @Override
  @Nullable
  public PsiElement getNameIdentifier() {
    return AuthzPsiImplUtil.getNameIdentifier(this);
  }

  @Override
  @NotNull
  public PsiReference[] getReferences() {
    return AuthzPsiImplUtil.getReferences(this);
  }

}
