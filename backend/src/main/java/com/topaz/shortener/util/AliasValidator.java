package com.topaz.shortener.util;

import com.topaz.shortener.exception.InvalidAliasException;

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

    public static void assertValidCustomAlias(String alias) {
        String normalized = normalize(alias);
        if (!isValid(normalized)) {
            throw new InvalidAliasException("Alias invalido");
        }
        if (ReservedPathValidator.isReserved(normalized)) {
            throw new InvalidAliasException("Alias reservado");
        }
    }
}
