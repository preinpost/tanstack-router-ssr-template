import { defineConfig, type BuildEnvironmentOptions } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import tanstackRouter from '@tanstack/router-plugin/vite'
import path, { resolve } from 'node:path'

const ssrBuildConfig: BuildEnvironmentOptions = {
  ssr: true,
  outDir: 'dist/server',
  ssrEmitAssets: true,
  copyPublicDir: true,
  emptyOutDir: true,
  rollupOptions: {
    input: path.resolve(__dirname, 'src/entry-server.tsx'),
    output: {
      entryFileNames: '[name].js',
      chunkFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
    },
  },
}

// Client-specific configuration
const clientBuildConfig: BuildEnvironmentOptions = {
  outDir: 'dist/client',
  emitAssets: true,
  copyPublicDir: true,
  emptyOutDir: true,
  rollupOptions: {
    input: path.resolve(__dirname, 'src/entry-client.tsx'),
    output: {
      entryFileNames: 'static/[name].js',
      chunkFileNames: 'static/assets/[name]-[hash].js',
      assetFileNames: 'static/assets/[name]-[hash][extname]',
    },
  },
}

/** @type {import('vite').UserConfig} */
export default defineConfig((configEnv) => {
  return {
  plugins: [
    tanstackRouter({  target: 'react', autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: configEnv.isSsrBuild ? ssrBuildConfig : clientBuildConfig,
}
})