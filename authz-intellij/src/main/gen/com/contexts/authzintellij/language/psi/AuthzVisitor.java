// This is a generated file. Not intended for manual editing.
package com.contexts.authzintellij.language.psi;

import org.jetbrains.annotations.*;
import com.intellij.psi.PsiElementVisitor;
import com.intellij.psi.PsiElement;

public class AuthzVisitor extends PsiElementVisitor {

  public void visitDefinitionBlock(@NotNull AuthzDefinitionBlock o) {
    visitPsiElement(o);
  }

  public void visitDefinitionBlockItems(@NotNull AuthzDefinitionBlockItems o) {
    visitPsiElement(o);
  }

  public void visitDefinitionDef(@NotNull AuthzDefinitionDef o) {
    visitPsiElement(o);
  }

  public void visitDefinitionNameDef(@NotNull AuthzDefinitionNameDef o) {
    visitNamedElement(o);
  }

  public void visitPermissionDef(@NotNull AuthzPermissionDef o) {
    visitPsiElement(o);
  }

  public void visitPermissionDefName(@NotNull AuthzPermissionDefName o) {
    visitNamedElement(o);
  }

  public void visitPermissionExpression(@NotNull AuthzPermissionExpression o) {
    visitPsiElement(o);
  }

  public void visitPermissionExpressionOperator(@NotNull AuthzPermissionExpressionOperator o) {
    visitPsiElement(o);
  }

  public void visitPermissionReference(@NotNull AuthzPermissionReference o) {
    visitPsiElement(o);
  }

  public void visitPermissionReferencePermissionName(@NotNull AuthzPermissionReferencePermissionName o) {
    visitNamedElement(o);
  }

  public void visitPermissionReferenceRelationName(@NotNull AuthzPermissionReferenceRelationName o) {
    visitNamedElement(o);
  }

  public void visitRelationDef(@NotNull AuthzRelationDef o) {
    visitPsiElement(o);
  }

  public void visitRelationDefName(@NotNull AuthzRelationDefName o) {
    visitNamedElement(o);
  }

  public void visitRelationExpression(@NotNull AuthzRelationExpression o) {
    visitPsiElement(o);
  }

  public void visitRelationExpressionOperator(@NotNull AuthzRelationExpressionOperator o) {
    visitPsiElement(o);
  }

  public void visitRelationType(@NotNull AuthzRelationType o) {
    visitNamedElement(o);
  }

  public void visitNamedElement(@NotNull AuthzNamedElement o) {
    visitPsiElement(o);
  }

  public void visitPsiElement(@NotNull PsiElement o) {
    visitElement(o);
  }

}
