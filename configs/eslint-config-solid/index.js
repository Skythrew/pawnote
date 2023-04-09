// @ts-check
// eslint-disable-next-line no-undef
module.exports = /** @type {import('@typescript-eslint/utils').TSESLint.Linter.Config} */ ({
  plugins: ["solid"],
  extends: [
    "@pawnote/eslint-config",
    "plugin:solid/typescript"
  ],
  rules: {
    "solid/jsx-no-undef": "off",
    "solid/no-innerhtml": "off"
  }
});
