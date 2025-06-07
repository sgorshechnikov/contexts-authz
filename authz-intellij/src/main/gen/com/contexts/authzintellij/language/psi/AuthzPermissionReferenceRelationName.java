// This is a generated file. Not intended for manual editing.
package com.contexts.authzintellij.language.psi;

import java.util.List;
import org.jetbrains.annotations.*;
import com.intellij.psi.PsiElement;
import com.intellij.psi.PsiReference;

public interface AuthzPermissionReferenceRelationName extends AuthzNamedElement {

  @Nullable
  String getName();

  @NotNull
  PsiElement setName(@NotNull String newName);

  @Nullable
  PsiElement getNameIdentifier();

  @NotNull
  PsiReference[] getReferences();

}
