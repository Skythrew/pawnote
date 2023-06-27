import dts from "rollup-plugin-dts";

import tsConfigPaths from "rollup-plugin-tsconfig-paths";
import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import path from "node:path";
import fs from "node:fs";

const pkg = JSON.parse(
  fs.readFileSync(
    path.resolve("./package.json"),
    { encoding: "utf-8" }
  )
);

const name = pkg.main.replace(/\.js$/, "");

const bundle = config => ({
  ...config,
  input: "src/index.ts",
  external: id => ["node-forge"].includes(id)
});

export default [
  bundle({
    plugins: [tsConfigPaths(), nodeResolve(), commonjs(), esbuild()],
    output: [
      {
        file: `${name}.js`,
        format: "cjs",
        sourcemap: true
      },
      {
        file: `${name}.mjs`,
        format: "es",
        sourcemap: true
      }
    ]
  }),
  bundle({
    plugins: [tsConfigPaths(), nodeResolve(), commonjs(), dts()],
    output: {
      file: `${name}.d.ts`,
      format: "es"
    }
  })
];
