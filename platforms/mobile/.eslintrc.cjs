module.exports = {
  root: true,
  extends: [
    "@pawnote/eslint-config-solid",
    "@unocss"
  ],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname
  }
};
