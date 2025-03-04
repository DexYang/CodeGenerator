/// <reference types="vitest" />
/* eslint-disable node/prefer-global/process */
import type { ConfigEnv, UserConfigExport } from 'vite'
import path from 'node:path'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { loadEnv } from 'vite'
import Pages from 'vite-plugin-pages'

export default ({ mode }: ConfigEnv): UserConfigExport => {
    const root = process.cwd()
    const env = loadEnv(mode, root) as unknown as ImportMetaEnv
    return {
        worker: {
            format: 'es'
        },
        resolve: {
            alias: {
                '~/': `${path.resolve(__dirname, 'src')}/`
            }
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        'vue': ['vue', '@vueuse/core', 'vue-router'],
                        'naive': ['naive-ui'],
                        'generate': ['better-mock', 'ejs', 'file-saver', 'jszip'],
                        'codemirror': ['codemirror', 'vue-codemirror'],
                        '@codemirror': ['@codemirror/lang-java', '@codemirror/lang-javascript', '@codemirror/theme-one-dark']
                    }
                }
            }
        },
        base: env.VITE_BASE_URL,
        plugins: [
            VueMacros({
                plugins: {
                    vue: Vue({})
                }
            }),

            // https://github.com/hannoeru/vite-plugin-pages
            Pages(),

            // https://github.com/antfu/unplugin-auto-import
            AutoImport({
                imports: [
                    'vue',
                    'vue/macros',
                    'vue-router',
                    '@vueuse/core'
                ],
                dts: true,
                dirs: [
                    './src/composables'
                ],
                vueTemplate: true
            }),

            // https://github.com/antfu/vite-plugin-components
            Components({
                dts: true,
                resolvers: [
                    NaiveUiResolver()
                ],
                include: [/\.vue$/, /\.vue\?vue/, /\.md$/]
            }),

            // https://github.com/antfu/unocss
            // see uno.config.ts for config
            UnoCSS()
        ],
        // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
        //
        // 1. prevent vite from obscuring rust errors
        clearScreen: false,
        // 2. tauri expects a fixed port, fail if that port is not available
        server: {
            port: 3333,
            strictPort: true,
            host: false,
            watch: {
            // 3. tell vite to ignore watching `src-tauri`
                ignored: ['**/src-tauri/**']
            }
        }
    }
}
