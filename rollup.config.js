import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import pkg from './package.json'

export default [
  {
    external: ['react'],
    input: 'src/index.ts',
    plugins: [typescript()],
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'es'
      }
    ]
  },
  {
    input: '.cache/src/index.d.ts',
    plugins: [dts()],
    output: {
      file: pkg.types,
      format: 'es'
    }
  }
]
