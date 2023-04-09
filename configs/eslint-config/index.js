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
      "error", 2
    ],
    "semi": [
      "error", "always"
    ],
    "eol-last": [
      "error", "always"
    ],
    "eqeqeq": [
      "error", "always"
    ],
    "comma-dangle": [
      "error", "never"
    ],

    "no-return-await": "error",
    "no-trailing-spaces": "error",

    "@typescript-eslint/no-non-null-assertion": "off"
  }
});
