import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import pkg from './package.json';

const banner = `/*!${pkg.name} v${pkg.version}${new Date().getFullYear()}年${new Date().getMonth() + 1
  }月${new Date()}制作*/`

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      rollupTypes: true
    })],

  build: {
    outDir: 'lib',
    // minify: true, // 不压缩代码,方便开发调试
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'SketchRuler',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['styled-components',  'panzoom', 'react', 'react-dom'],
      output: {
        banner,
        globals: {
          panzoom: 'simple-panzoom' // 这里假设 panzoom 暴露在全局变量 Panzoom 下
        }
      }
    }
  }
})
