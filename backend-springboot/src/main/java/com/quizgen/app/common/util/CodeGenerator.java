package com.quizgen.app.common.util;

import java.util.UUID;

public final class CodeGenerator {

    private CodeGenerator() {
    }

    public static String nextCode() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}