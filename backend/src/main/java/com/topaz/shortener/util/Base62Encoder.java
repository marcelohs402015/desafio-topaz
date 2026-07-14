package com.topaz.shortener.util;

public final class Base62Encoder {

    private static final char[] ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final int BASE = ALPHABET.length;

    private Base62Encoder() {
    }

    public static String encode(long value) {
        if (value == 0) {
            return String.valueOf(ALPHABET[0]);
        }
        StringBuilder builder = new StringBuilder();
        long current = value;
        while (current > 0) {
            int remainder = (int) (current % BASE);
            builder.append(ALPHABET[remainder]);
            current = current / BASE;
        }
        return builder.reverse().toString();
    }
}
