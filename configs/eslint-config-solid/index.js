// @ts-check
// eslint-disable-next-line no-undef
module.exports = /** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */ ({
  plugins: ["solid"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    "@pawnote/eslint-config",
    "plugin:solid/typescript"
  ],
  rules: {
    "solid/jsx-no-undef": "off",
    "solid/no-innerhtml": "off",

    "jsx-quotes": [
      "error", "prefer-double"
    ]
  }
});
