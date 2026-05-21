import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import pkg from '../../package.json'

const banner = `/*!${pkg.name} v${pkg.version}${new Date().getFullYear()}年${
  new Date().getMonth() + 1
}月${new Date()}制作*/`

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  plugins: [
    react(),
    dts({
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      entryRoot: resolve(__dirname, 'src'),
      include: [resolve(__dirname, 'src')],
      exclude: [resolve(__dirname, 'vite.config.ts')]
    })
  ],
  build: {
    outDir: 'lib',
    minify: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'SketchRuler',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@sketch-ruler/core', '@sketch-ruler/canvas'],
      output: {
        exports: 'named',
        banner,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@sketch-ruler/core': 'SketchRulerCore',
          '@sketch-ruler/canvas': 'SketchRulerCanvas'
        }
      }
    }
  }
})
