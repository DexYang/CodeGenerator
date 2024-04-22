/// <reference types="vitest" />
/* eslint-disable node/prefer-global/process */
import path from 'node:path'
import type { ConfigEnv, UserConfigExport } from 'vite'
import { loadEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default ({ mode }: ConfigEnv): UserConfigExport => {
    const root = process.cwd()
    const env = loadEnv(mode, root) as unknown as ImportMetaEnv
    return {
        resolve: {
            alias: {
                '~/': `${path.resolve(__dirname, 'src')}/`
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
        ]
    }
}
