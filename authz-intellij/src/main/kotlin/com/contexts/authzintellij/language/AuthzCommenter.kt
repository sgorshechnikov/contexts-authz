package com.contexts.authzintellij.language

import com.intellij.lang.Commenter


internal class AuthzCommenter : Commenter {
    override fun getLineCommentPrefix(): String {
        return "# "
    }

    override fun getBlockCommentPrefix(): String {
        return ""
    }

    override fun getBlockCommentSuffix(): String? {
        return null
    }

    override fun getCommentedBlockCommentPrefix(): String? {
        return null
    }

    override fun getCommentedBlockCommentSuffix(): String? {
        return null
    }
}