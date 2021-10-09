module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true
    },

    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },

    // Position is important, the last rules take precident here. For the least amount of prettier conficts with other eslint plugins.
    // it has to come last
    extends: ["eslint:recommended", "plugin:vue/recommended", "@vue/typescript", "prettier/vue"],

    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        parser: "@typescript-eslint/parser"
    },

    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "linebreak-style": ["error", "unix"],
        quotes: ["warn", "double"],
        semi: ["warn", "always"],
        "no-unused-vars": "off",
        "no-case-declarations": "off",
        "vue/max-attributes-per-line": "off",
        "no-prototype-builtins": "off",
        "space-before-function-paren": "off",
        "no-useless-escape": "off",
        "no-empty-pattern": "warn"
    },

    ignorePatterns: ["src/test/**", "tests/**", "**/examples/**", "**/parameterMenu.js"],

    overrides: [
        {
            files: ["**/__tests__/*.{j,t}s?(x)", "**/tests/unit/**/*.spec.{j,t}s?(x)"],
            env: {
                mocha: true
            }
        }
    ]
};
