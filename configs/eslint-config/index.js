// @ts-check
// eslint-disable-next-line no-undef
module.exports = /** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */ ({
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "brace-style": [
      "error", "stroustrup"
    ],
    "quotes": [
      "error", "double"
    ],
    "indent": [
      "error", 2, { "SwitchCase": 1 }
    ],
    "semi": [
      "error", "always"
    ],

    "n/no-callback-literal": "off",
    "@typescript-eslint/no-extra-semi": "off"
  }
});
