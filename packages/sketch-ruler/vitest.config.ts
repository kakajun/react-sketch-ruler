import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const corePath = resolve(__dirname, '../../../vue3-sketch-ruler/packages/core/src/index.ts')
const canvasPath = resolve(__dirname, '../../../vue3-sketch-ruler/packages/canvas/src/index.ts')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sketch-ruler/core': corePath,
      '@sketch-ruler/canvas': canvasPath
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
