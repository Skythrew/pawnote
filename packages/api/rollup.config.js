import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import tsConfigPaths from "rollup-plugin-tsconfig-paths"
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: "src/index.ts",
    plugins: [resolve(), tsConfigPaths(), commonjs(), esbuild({ minify: true })],
    output: {
      dir: "dist",
      format: "es",
      sourcemap: true
    }
  },
  {
    input: "src/index.ts",
    plugins: [resolve(), tsConfigPaths(), dts()],
    output: {
      file: "dist/index.d.ts",
      format: 'es',
    },
  }
];
