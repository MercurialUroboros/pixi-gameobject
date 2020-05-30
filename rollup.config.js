import typescript from 'rollup-plugin-typescript2';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import pkg from './package.json';

let override = { compilerOptions: { declaration: false, emitDeclarationOnly: false } };

export default {
  input: 'src/index.ts', // our source file
  output: [
    {
      dir: 'dist',
      entryFileNames: 'lib.[format].js',
      format: 'cjs'
    },
    {
      entryFileNames: 'lib.[format].js',
      dir: 'dist',
      format: 'es' // the preferred format
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {})
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      tsconfigOverride: override
    }),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env']
    })
  ]
};

