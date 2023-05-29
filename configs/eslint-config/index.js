// @ts-check
// eslint-disable-next-line no-undef
module.exports = /** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */ ({
  extends: "standard-with-typescript",
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
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/brace-style": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  }
});
