package com.contexts.authzintellij.language.psi.impl

import com.contexts.authzintellij.language.psi.*
import com.intellij.lang.ASTNode
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiReference
import com.intellij.psi.impl.source.resolve.reference.ReferenceProvidersRegistry.getReferencesFromProviders


object AuthzPsiImplUtil {
    // Relation Type
    @JvmStatic
    fun getName(element: AuthzRelationType): String? {
        return element.node.findChildByType(AuthzTypes.IDENTIFIER)?.text
    }

    @JvmStatic
    fun setName(element: AuthzRelationType, newName: String): PsiElement {
        val keyNode: ASTNode? = element.node.findChildByType(AuthzTypes.IDENTIFIER)
        if (keyNode != null) {
            val property: AuthzRelationType =
                AuthzElementFactory.createProperty(element.project, newName)
            val newKeyNode: ASTNode = property.firstChild.node
            element.getNode().replaceChild(keyNode, newKeyNode)
        }
        return element
    }

    @JvmStatic
    fun getNameIdentifier(element: AuthzRelationType): PsiElement? {
        return element.node.findChildByType(AuthzTypes.IDENTIFIER)?.psi
    }

    @JvmStatic
    fun getReferences(element: AuthzRelationType): Array<PsiReference> {
        return getReferencesFromProviders(element)
    }

    @JvmStatic
    fun handleElementRename(element: AuthzRelationType, newName: String): PsiElement {
        return setName(element, newName)
    }

    // Definition Name

    @JvmStatic
    fun getName(element: AuthzDefinitionNameDef): String? {
        return element.node.findChildByType(AuthzTypes.IDENTIFIER)?.text
    }

    @JvmStatic
    fun setName(element: AuthzDefinitionNameDef, newName: String): PsiElement {
        val keyNode: ASTNode? = element.node.findChildByType(AuthzTypes.IDENTIFIER)
        if (keyNode != null) {
            val property: AuthzDefinitionNameDef =
                AuthzElementFactory.createProperty(element.project, newName)
            val newKeyNode: ASTNode = property.firstChild.node
            element.getNode().replaceChild(keyNode, newKeyNode)
        }
        return element
    }

    @JvmStatic
    fun getNameIdentifier(element: AuthzDefinitionNameDef): PsiElement? {
        return element.node.findChildByType(AuthzTypes.IDENTIFIER)?.psi
    }

    @JvmStatic
    fun getReferences(element: AuthzDefinitionNameDef): Array<PsiReference> {
        return getReferencesFromProviders(element)
    }

    // Relation Def Name

    @JvmStatic
    fun getName(element: AuthzRelationDefName): String? {
        return element.node.findChildByType(AuthzTypes.RELATION_NAME)?.text
    }

    @JvmStatic
    fun setName(element: AuthzRelationDefName, newName: String): PsiElement {
        val keyNode: ASTNode? = element.node.findChildByType(AuthzTypes.RELATION_NAME)
        if (keyNode != null) {
            val property: AuthzRelationDefName =
                AuthzElementFactory.createProperty(element.project, newName)
            val newKeyNode: ASTNode = property.firstChild.node
            element.getNode().replaceChild(keyNode, newKeyNode)
        }
        return element
    }

    @JvmStatic
    fun getNameIdentifier(element: AuthzRelationDefName): PsiElement? {
        return element.node.findChildByType(AuthzTypes.RELATION_NAME)?.psi
    }

    @JvmStatic
    fun getReferences(element: AuthzRelationDefName): Array<PsiReference> {
        return getReferencesFromProviders(element)
    }

    // Relation Reference from permission definition

    @JvmStatic
    fun getName(element: AuthzPermissionReferenceRelationName): String? {
        return element.node.findChildByType(AuthzTypes.RELATION_NAME)?.text
    }

    @JvmStatic
    fun setName(element: AuthzPermissionReferenceRelationName, newName: String): PsiElement {
        val keyNode: ASTNode? = element.node.findChildByType(AuthzTypes.RELATION_NAME)
        if (keyNode != null) {
            val property: AuthzPermissionReferenceRelationName =
                AuthzElementFactory.createProperty(element.project, newName)
            val newKeyNode: ASTNode = property.firstChild.node
            element.getNode().replaceChild(keyNode, newKeyNode)
        }
        return element
    }

    @JvmStatic
    fun getNameIdentifier(element: AuthzPermissionReferenceRelationName): PsiElement? {
        return element.node.findChildByType(AuthzTypes.RELATION_NAME)?.psi
    }

    @JvmStatic
    fun getReferences(element: AuthzPermissionReferenceRelationName): Array<PsiReference> {
        return getReferencesFromProviders(element)
    }

    // Permission Def Name

    @JvmStatic
    fun getName(element: AuthzPermissionDefName): String? {
        return element.node.findChildByType(AuthzTypes.PERMISSION_NAME)?.text
    }

    @JvmStatic
    fun setName(element: AuthzPermissionDefName, newName: String): PsiElement {
        val keyNode: ASTNode? = element.node.findChildByType(AuthzTypes.PERMISSION_NAME)
        if (keyNode != null) {
            val property: AuthzPermissionDefName =
                AuthzElementFactory.createProperty(element.project, newName)
            val newKeyNode: ASTNode = property.firstChild.node
            element.getNode().replaceChild(keyNode, newKeyNode)
        }
        return element
    }

    @JvmStatic
    fun getNameIdentifier(element: AuthzPermissionDefName): PsiElement? {
        return element.node.findChildByType(AuthzTypes.PERMISSION_NAME)?.psi
    }

    @JvmStatic
    fun getReferences(element: AuthzPermissionDefName): Array<PsiReference> {
        return getReferencesFromProviders(element)
    }

    // Relation Reference from permission definition

    @JvmStatic
    fun getName(element: AuthzPermissionReferencePermissionName): String? {
        return element.node.findChildByType(AuthzTypes.PERMISSION_NAME)?.text
    }

    @JvmStatic
    fun setName(element: AuthzPermissionReferencePermissionName, newName: String): PsiElement {
        val keyNode: ASTNode? = element.node.findChildByType(AuthzTypes.PERMISSION_NAME)
        if (keyNode != null) {
            val property: AuthzPermissionReferencePermissionName =
                AuthzElementFactory.createProperty(element.project, newName)
            val newKeyNode: ASTNode = property.firstChild.node
            element.getNode().replaceChild(keyNode, newKeyNode)
        }
        return element
    }

    @JvmStatic
    fun getNameIdentifier(element: AuthzPermissionReferencePermissionName): PsiElement? {
        return element.node.findChildByType(AuthzTypes.PERMISSION_NAME)?.psi
    }

    @JvmStatic
    fun getReferences(element: AuthzPermissionReferencePermissionName): Array<PsiReference> {
        return getReferencesFromProviders(element)
    }
}