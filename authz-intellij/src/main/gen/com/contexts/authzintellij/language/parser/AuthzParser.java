// This is a generated file. Not intended for manual editing.
package com.contexts.authzintellij.language.parser;

import com.intellij.lang.PsiBuilder;
import com.intellij.lang.PsiBuilder.Marker;
import static com.contexts.authzintellij.language.psi.AuthzTypes.*;
import static com.contexts.authzintellij.language.parser.AuthzParserUtil.*;
import com.intellij.psi.tree.IElementType;
import com.intellij.lang.ASTNode;
import com.intellij.psi.tree.TokenSet;
import com.intellij.lang.PsiParser;
import com.intellij.lang.LightPsiParser;

@SuppressWarnings({"SimplifiableIfStatement", "UnusedAssignment"})
public class AuthzParser implements PsiParser, LightPsiParser {

  public ASTNode parse(IElementType t, PsiBuilder b) {
    parseLight(t, b);
    return b.getTreeBuilt();
  }

  public void parseLight(IElementType t, PsiBuilder b) {
    boolean r;
    b = adapt_builder_(t, b, this, null);
    Marker m = enter_section_(b, 0, _COLLAPSE_, null);
    r = parse_root_(t, b);
    exit_section_(b, 0, m, t, r, true, TRUE_CONDITION);
  }

  protected boolean parse_root_(IElementType t, PsiBuilder b) {
    return parse_root_(t, b, 0);
  }

  static boolean parse_root_(IElementType t, PsiBuilder b, int l) {
    return authzFile(b, l + 1);
  }

  /* ********************************************************** */
  // definitions
  static boolean authzFile(PsiBuilder b, int l) {
    return definitions(b, l + 1);
  }

  /* ********************************************************** */
  // "{" (definition_block_items)* "}"
  public static boolean definition_block(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block")) return false;
    if (!nextTokenIs(b, L_CURLY)) return false;
    boolean r, p;
    Marker m = enter_section_(b, l, _NONE_, DEFINITION_BLOCK, null);
    r = consumeToken(b, L_CURLY);
    p = r; // pin = 1
    r = r && report_error_(b, definition_block_1(b, l + 1));
    r = p && consumeToken(b, R_CURLY) && r;
    exit_section_(b, l, m, r, p, null);
    return r || p;
  }

  // (definition_block_items)*
  private static boolean definition_block_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_1")) return false;
    while (true) {
      int c = current_position_(b);
      if (!definition_block_1_0(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "definition_block_1", c)) break;
    }
    return true;
  }

  // (definition_block_items)
  private static boolean definition_block_1_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_1_0")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = definition_block_items(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  /* ********************************************************** */
  // !('}' | <<eof>>) (relation_def | permission_def | COMMENT)*
  public static boolean definition_block_items(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_items")) return false;
    boolean r, p;
    Marker m = enter_section_(b, l, _NONE_, DEFINITION_BLOCK_ITEMS, "<definition block items>");
    r = definition_block_items_0(b, l + 1);
    p = r; // pin = 1
    r = r && definition_block_items_1(b, l + 1);
    exit_section_(b, l, m, r, p, AuthzParser::definition_block_items_recover);
    return r || p;
  }

  // !('}' | <<eof>>)
  private static boolean definition_block_items_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_items_0")) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NOT_);
    r = !definition_block_items_0_0(b, l + 1);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // '}' | <<eof>>
  private static boolean definition_block_items_0_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_items_0_0")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, R_CURLY);
    if (!r) r = eof(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  // (relation_def | permission_def | COMMENT)*
  private static boolean definition_block_items_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_items_1")) return false;
    while (true) {
      int c = current_position_(b);
      if (!definition_block_items_1_0(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "definition_block_items_1", c)) break;
    }
    return true;
  }

  // relation_def | permission_def | COMMENT
  private static boolean definition_block_items_1_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_items_1_0")) return false;
    boolean r;
    r = relation_def(b, l + 1);
    if (!r) r = permission_def(b, l + 1);
    if (!r) r = consumeToken(b, COMMENT);
    return r;
  }

  /* ********************************************************** */
  // !('}' | <<eof>>)
  static boolean definition_block_items_recover(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_items_recover")) return false;
    boolean r;
    Marker m = enter_section_(b, l, _NOT_);
    r = !definition_block_items_recover_0(b, l + 1);
    exit_section_(b, l, m, r, false, null);
    return r;
  }

  // '}' | <<eof>>
  private static boolean definition_block_items_recover_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_block_items_recover_0")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, R_CURLY);
    if (!r) r = eof(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  /* ********************************************************** */
  // definition definition_name_def definition_block
  public static boolean definition_def(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_def")) return false;
    if (!nextTokenIs(b, DEFINITION)) return false;
    boolean r, p;
    Marker m = enter_section_(b, l, _NONE_, DEFINITION_DEF, null);
    r = consumeToken(b, DEFINITION);
    p = r; // pin = 1
    r = r && report_error_(b, definition_name_def(b, l + 1));
    r = p && definition_block(b, l + 1) && r;
    exit_section_(b, l, m, r, p, null);
    return r || p;
  }

  /* ********************************************************** */
  // IDENTIFIER
  public static boolean definition_name_def(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definition_name_def")) return false;
    if (!nextTokenIs(b, IDENTIFIER)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, IDENTIFIER);
    exit_section_(b, m, DEFINITION_NAME_DEF, r);
    return r;
  }

  /* ********************************************************** */
  // (definition_def | COMMENT)*
  static boolean definitions(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definitions")) return false;
    while (true) {
      int c = current_position_(b);
      if (!definitions_0(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "definitions", c)) break;
    }
    return true;
  }

  // definition_def | COMMENT
  private static boolean definitions_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "definitions_0")) return false;
    boolean r;
    r = definition_def(b, l + 1);
    if (!r) r = consumeToken(b, COMMENT);
    return r;
  }

  /* ********************************************************** */
  // permission permission_def_name EQUALS permission_expression
  public static boolean permission_def(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_def")) return false;
    if (!nextTokenIs(b, PERMISSION)) return false;
    boolean r, p;
    Marker m = enter_section_(b, l, _NONE_, PERMISSION_DEF, null);
    r = consumeToken(b, PERMISSION);
    p = r; // pin = 1
    r = r && report_error_(b, permission_def_name(b, l + 1));
    r = p && report_error_(b, consumeToken(b, EQUALS)) && r;
    r = p && permission_expression(b, l + 1) && r;
    exit_section_(b, l, m, r, p, null);
    return r || p;
  }

  /* ********************************************************** */
  // PERMISSION_NAME
  public static boolean permission_def_name(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_def_name")) return false;
    if (!nextTokenIs(b, PERMISSION_NAME)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, PERMISSION_NAME);
    exit_section_(b, m, PERMISSION_DEF_NAME, r);
    return r;
  }

  /* ********************************************************** */
  // permission_reference (permission_expression_operator permission_reference)*
  public static boolean permission_expression(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_expression")) return false;
    if (!nextTokenIs(b, RELATION_NAME)) return false;
    boolean r, p;
    Marker m = enter_section_(b, l, _NONE_, PERMISSION_EXPRESSION, null);
    r = permission_reference(b, l + 1);
    p = r; // pin = 1
    r = r && permission_expression_1(b, l + 1);
    exit_section_(b, l, m, r, p, null);
    return r || p;
  }

  // (permission_expression_operator permission_reference)*
  private static boolean permission_expression_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_expression_1")) return false;
    while (true) {
      int c = current_position_(b);
      if (!permission_expression_1_0(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "permission_expression_1", c)) break;
    }
    return true;
  }

  // permission_expression_operator permission_reference
  private static boolean permission_expression_1_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_expression_1_0")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = permission_expression_operator(b, l + 1);
    r = r && permission_reference(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  /* ********************************************************** */
  // PLUS
  public static boolean permission_expression_operator(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_expression_operator")) return false;
    if (!nextTokenIs(b, PLUS)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, PLUS);
    exit_section_(b, m, PERMISSION_EXPRESSION_OPERATOR, r);
    return r;
  }

  /* ********************************************************** */
  // permission_reference_relation_name (DOT permission_reference_permission_name)?
  public static boolean permission_reference(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_reference")) return false;
    if (!nextTokenIs(b, RELATION_NAME)) return false;
    boolean r, p;
    Marker m = enter_section_(b, l, _NONE_, PERMISSION_REFERENCE, null);
    r = permission_reference_relation_name(b, l + 1);
    p = r; // pin = 1
    r = r && permission_reference_1(b, l + 1);
    exit_section_(b, l, m, r, p, null);
    return r || p;
  }

  // (DOT permission_reference_permission_name)?
  private static boolean permission_reference_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_reference_1")) return false;
    permission_reference_1_0(b, l + 1);
    return true;
  }

  // DOT permission_reference_permission_name
  private static boolean permission_reference_1_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_reference_1_0")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, DOT);
    r = r && permission_reference_permission_name(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  /* ********************************************************** */
  // PERMISSION_NAME
  public static boolean permission_reference_permission_name(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_reference_permission_name")) return false;
    if (!nextTokenIs(b, PERMISSION_NAME)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, PERMISSION_NAME);
    exit_section_(b, m, PERMISSION_REFERENCE_PERMISSION_NAME, r);
    return r;
  }

  /* ********************************************************** */
  // RELATION_NAME
  public static boolean permission_reference_relation_name(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "permission_reference_relation_name")) return false;
    if (!nextTokenIs(b, RELATION_NAME)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, RELATION_NAME);
    exit_section_(b, m, PERMISSION_REFERENCE_RELATION_NAME, r);
    return r;
  }

  /* ********************************************************** */
  // relation relation_def_name COLON relation_expression
  public static boolean relation_def(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "relation_def")) return false;
    if (!nextTokenIs(b, RELATION)) return false;
    boolean r, p;
    Marker m = enter_section_(b, l, _NONE_, RELATION_DEF, null);
    r = consumeToken(b, RELATION);
    p = r; // pin = 1
    r = r && report_error_(b, relation_def_name(b, l + 1));
    r = p && report_error_(b, consumeToken(b, COLON)) && r;
    r = p && relation_expression(b, l + 1) && r;
    exit_section_(b, l, m, r, p, null);
    return r || p;
  }

  /* ********************************************************** */
  // RELATION_NAME
  public static boolean relation_def_name(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "relation_def_name")) return false;
    if (!nextTokenIs(b, RELATION_NAME)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, RELATION_NAME);
    exit_section_(b, m, RELATION_DEF_NAME, r);
    return r;
  }

  /* ********************************************************** */
  // relation_type (relation_expression_operator relation_type)*
  public static boolean relation_expression(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "relation_expression")) return false;
    if (!nextTokenIs(b, IDENTIFIER)) return false;
    boolean r, p;
    Marker m = enter_section_(b, l, _NONE_, RELATION_EXPRESSION, null);
    r = relation_type(b, l + 1);
    p = r; // pin = 1
    r = r && relation_expression_1(b, l + 1);
    exit_section_(b, l, m, r, p, null);
    return r || p;
  }

  // (relation_expression_operator relation_type)*
  private static boolean relation_expression_1(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "relation_expression_1")) return false;
    while (true) {
      int c = current_position_(b);
      if (!relation_expression_1_0(b, l + 1)) break;
      if (!empty_element_parsed_guard_(b, "relation_expression_1", c)) break;
    }
    return true;
  }

  // relation_expression_operator relation_type
  private static boolean relation_expression_1_0(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "relation_expression_1_0")) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = relation_expression_operator(b, l + 1);
    r = r && relation_type(b, l + 1);
    exit_section_(b, m, null, r);
    return r;
  }

  /* ********************************************************** */
  // PIPE
  public static boolean relation_expression_operator(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "relation_expression_operator")) return false;
    if (!nextTokenIs(b, PIPE)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, PIPE);
    exit_section_(b, m, RELATION_EXPRESSION_OPERATOR, r);
    return r;
  }

  /* ********************************************************** */
  // IDENTIFIER
  public static boolean relation_type(PsiBuilder b, int l) {
    if (!recursion_guard_(b, l, "relation_type")) return false;
    if (!nextTokenIs(b, IDENTIFIER)) return false;
    boolean r;
    Marker m = enter_section_(b);
    r = consumeToken(b, IDENTIFIER);
    exit_section_(b, m, RELATION_TYPE, r);
    return r;
  }

}
