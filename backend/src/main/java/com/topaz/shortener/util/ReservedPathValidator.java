package com.topaz.shortener.util;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public final class ReservedPathValidator {

    private static final Set<String> RESERVED = new HashSet<>(Arrays.asList(
            "api",
            "actuator",
            "login",
            "shorten",
            "urls"
    ));

    private ReservedPathValidator() {
    }

    public static boolean isReserved(String path) {
        if (path == null) {
            return true;
        }
        return RESERVED.contains(path.toLowerCase());
    }
}
