import routes from 'virtual:generated-pages'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { pinia } from '~/store'
import App from './App.vue'

import 'virtual:uno.css'

const app = createApp(App)
const router = createRouter({
    history: createWebHistory(),
    routes
})
app.use(router)
app.use(pinia)
app.mount('#app')
