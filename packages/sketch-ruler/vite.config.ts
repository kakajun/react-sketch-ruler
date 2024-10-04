import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import pkg from '../../package.json';

const banner = `/*!${pkg.name} v${pkg.version}${new Date().getFullYear()}年${new Date().getMonth() + 1
  }月${new Date()}制作*/`;

// https://vitejs.dev/config/
export default defineConfig({
  // 定义常量全局替换
  define: {
     'process.env.NODE_ENV': '"production"'
  },
  plugins: [
    react(),
    dts({
      rollupTypes: true,
        tsconfigPath: resolve(__dirname, 'tsconfig.json') // 指定 tsconfig 文件
    })],

  build: {
    outDir: 'lib',
    minify: false, // 不压缩代码,方便开发调试
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'SketchRuler',
      fileName: 'index'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react', 'react-dom'],
      output: {
        banner,
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: 'React',
          'react-dom': 'react-dom',
        }
      }
    }
  }
});
