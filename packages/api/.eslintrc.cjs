module.exports = {
  root: true,
  extends: [
    "@pawnote/eslint-config"
  ],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname
  }
};
