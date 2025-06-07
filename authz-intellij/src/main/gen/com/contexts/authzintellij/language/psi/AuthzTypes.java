// This is a generated file. Not intended for manual editing.
package com.contexts.authzintellij.language.psi;

import com.intellij.psi.tree.IElementType;
import com.intellij.psi.PsiElement;
import com.intellij.lang.ASTNode;
import com.contexts.authzintellij.language.psi.impl.*;

public interface AuthzTypes {

  IElementType DEFINITION_BLOCK = new AuthzElementType("DEFINITION_BLOCK");
  IElementType DEFINITION_BLOCK_ITEMS = new AuthzElementType("DEFINITION_BLOCK_ITEMS");
  IElementType DEFINITION_DEF = new AuthzElementType("DEFINITION_DEF");
  IElementType DEFINITION_NAME_DEF = new AuthzElementType("DEFINITION_NAME_DEF");
  IElementType PERMISSION_DEF = new AuthzElementType("PERMISSION_DEF");
  IElementType PERMISSION_DEF_NAME = new AuthzElementType("PERMISSION_DEF_NAME");
  IElementType PERMISSION_EXPRESSION = new AuthzElementType("PERMISSION_EXPRESSION");
  IElementType PERMISSION_EXPRESSION_OPERATOR = new AuthzElementType("PERMISSION_EXPRESSION_OPERATOR");
  IElementType PERMISSION_REFERENCE = new AuthzElementType("PERMISSION_REFERENCE");
  IElementType PERMISSION_REFERENCE_PERMISSION_NAME = new AuthzElementType("PERMISSION_REFERENCE_PERMISSION_NAME");
  IElementType PERMISSION_REFERENCE_RELATION_NAME = new AuthzElementType("PERMISSION_REFERENCE_RELATION_NAME");
  IElementType RELATION_DEF = new AuthzElementType("RELATION_DEF");
  IElementType RELATION_DEF_NAME = new AuthzElementType("RELATION_DEF_NAME");
  IElementType RELATION_EXPRESSION = new AuthzElementType("RELATION_EXPRESSION");
  IElementType RELATION_EXPRESSION_OPERATOR = new AuthzElementType("RELATION_EXPRESSION_OPERATOR");
  IElementType RELATION_TYPE = new AuthzElementType("RELATION_TYPE");

  IElementType COLON = new AuthzTokenType(":");
  IElementType COMMENT = new AuthzTokenType("COMMENT");
  IElementType DEFINITION = new AuthzTokenType("definition");
  IElementType DOT = new AuthzTokenType(".");
  IElementType EQUALS = new AuthzTokenType("=");
  IElementType IDENTIFIER = new AuthzTokenType("IDENTIFIER");
  IElementType L_CURLY = new AuthzTokenType("{");
  IElementType PERMISSION = new AuthzTokenType("permission");
  IElementType PERMISSION_NAME = new AuthzTokenType("PERMISSION_NAME");
  IElementType PIPE = new AuthzTokenType("|");
  IElementType PLUS = new AuthzTokenType("+");
  IElementType RELATION = new AuthzTokenType("relation");
  IElementType RELATION_NAME = new AuthzTokenType("RELATION_NAME");
  IElementType R_CURLY = new AuthzTokenType("}");

  class Factory {
    public static PsiElement createElement(ASTNode node) {
      IElementType type = node.getElementType();
      if (type == DEFINITION_BLOCK) {
        return new AuthzDefinitionBlockImpl(node);
      }
      else if (type == DEFINITION_BLOCK_ITEMS) {
        return new AuthzDefinitionBlockItemsImpl(node);
      }
      else if (type == DEFINITION_DEF) {
        return new AuthzDefinitionDefImpl(node);
      }
      else if (type == DEFINITION_NAME_DEF) {
        return new AuthzDefinitionNameDefImpl(node);
      }
      else if (type == PERMISSION_DEF) {
        return new AuthzPermissionDefImpl(node);
      }
      else if (type == PERMISSION_DEF_NAME) {
        return new AuthzPermissionDefNameImpl(node);
      }
      else if (type == PERMISSION_EXPRESSION) {
        return new AuthzPermissionExpressionImpl(node);
      }
      else if (type == PERMISSION_EXPRESSION_OPERATOR) {
        return new AuthzPermissionExpressionOperatorImpl(node);
      }
      else if (type == PERMISSION_REFERENCE) {
        return new AuthzPermissionReferenceImpl(node);
      }
      else if (type == PERMISSION_REFERENCE_PERMISSION_NAME) {
        return new AuthzPermissionReferencePermissionNameImpl(node);
      }
      else if (type == PERMISSION_REFERENCE_RELATION_NAME) {
        return new AuthzPermissionReferenceRelationNameImpl(node);
      }
      else if (type == RELATION_DEF) {
        return new AuthzRelationDefImpl(node);
      }
      else if (type == RELATION_DEF_NAME) {
        return new AuthzRelationDefNameImpl(node);
      }
      else if (type == RELATION_EXPRESSION) {
        return new AuthzRelationExpressionImpl(node);
      }
      else if (type == RELATION_EXPRESSION_OPERATOR) {
        return new AuthzRelationExpressionOperatorImpl(node);
      }
      else if (type == RELATION_TYPE) {
        return new AuthzRelationTypeImpl(node);
      }
      throw new AssertionError("Unknown element type: " + type);
    }
  }
}
