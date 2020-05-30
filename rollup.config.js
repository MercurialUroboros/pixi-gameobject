import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

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
    }),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env']
    })
  ]
};

