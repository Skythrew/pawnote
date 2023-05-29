module.exports = {
  root: true,
  extends: [
    "@pawnote/eslint-config-solid"
  ],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname
  }
};
