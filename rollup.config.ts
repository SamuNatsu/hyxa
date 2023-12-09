/// Rollup config
import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import shebang from 'rollup-plugin-shebang-bin';
import json from '@rollup/plugin-json';

/* Export config */
export default defineConfig({
  input: 'src/main.ts',
  output: {
    file: 'dist/main.mjs',
    format: 'esm'
  },
  plugins: [
    shebang({
      include: ['**/*.mjs']
    }),
    terser(),
    typescript(),
    json()
  ]
});
