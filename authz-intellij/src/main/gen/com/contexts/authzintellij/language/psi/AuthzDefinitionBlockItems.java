// This is a generated file. Not intended for manual editing.
package com.contexts.authzintellij.language.psi;

import java.util.List;
import org.jetbrains.annotations.*;
import com.intellij.psi.PsiElement;

public interface AuthzDefinitionBlockItems extends PsiElement {

  @NotNull
  List<AuthzPermissionDef> getPermissionDefList();

  @NotNull
  List<AuthzRelationDef> getRelationDefList();

}
