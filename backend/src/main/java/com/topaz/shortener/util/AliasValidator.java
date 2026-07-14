package com.topaz.shortener.util;

import java.util.regex.Pattern;

public final class AliasValidator {

    private static final Pattern ALIAS_PATTERN = Pattern.compile("^[a-zA-Z0-9-]{3,20}$");

    private AliasValidator() {
    }

    public static boolean isValid(String alias) {
        if (alias == null) {
            return false;
        }
        return ALIAS_PATTERN.matcher(alias).matches();
    }

    public static String normalize(String alias) {
        return alias.trim().toLowerCase();
    }
}
