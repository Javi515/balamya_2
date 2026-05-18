import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/balamya_2/',
    server: {
        port: 3000,
        historyApiFallback: true,
    },
    build: {
        outDir: 'build',
    },
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.js?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
})
