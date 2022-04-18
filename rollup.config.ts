import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import camelCase from 'lodash.camelcase';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
// import nodePolyfills from 'rollup-plugin-polyfill-node';

const isProd = process.env.NODE_ENV === 'production';
const pkg = require('./package.json');

const libraryName = 'index';
const config = {
  input: `src/${libraryName}.ts`,
  output: {
    file: pkg.main,
    name: camelCase(libraryName),
    format: 'umd',
    sourcemap: false,
    globals: {
      koa: 'Koa',
      'koa-bodyparser': 'bodyParser',
      'koa2-cors': 'KoaCros',
      portfinder: 'portfinder',
      'minimist': 'minimist',
      'fs-extra': 'fse',
      'log4js': 'log4js',
      'json-schema-faker': 'jsf',
      'typescript': 'ts',
      'typescript-json-schema': 'typescriptJsonSchema'
    },
  },
  external: [
    'fs-extra',
    'portfinder',
    'log4js',
    'typescript',
    'koa',
    'koa-bodyparser',
    'koa2-cors',
    'minimist',
    'json-schema-faker',
    'typescript-json-schema',
  ],
  plugins: [
    json(),
    typescript({ useTsconfigDeclarationDir: true }),
    // nodePolyfills(),
    resolve({
      browser: false,
      preferBuiltins: true,
    }),
    commonjs(),
  ],
};

if (isProd) {
  config.plugins.push(terser());
} else {
  // config.plugins.push(livereload());
}

export default config;
