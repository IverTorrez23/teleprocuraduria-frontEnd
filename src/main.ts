/* eslint-disable vue/multi-word-component-names */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import Editor from '@tinymce/tinymce-vue'
import VueTelInput from 'vue-tel-input'
import type { Plugin } from 'vue'
import 'vue-tel-input/vue-tel-input.css'
import { setupPrimeVue } from './config/primevue'
import '@/assets/styles.scss'
import PhoneInput from './common/components/Input/PhoneInput.vue'
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from './modules/auth/stores/auth.store'

const app = createApp(App)
const pinia = createPinia()

//app.use(VueTelInput)
app.use(VueTelInput as unknown as Plugin)
app.use(pinia)
app.use(router)
setupPrimeVue(app)

app.component('Editor', Editor) // De vue3
app.component('Treeselect', Treeselect) // De vue3
app.component('PhoneInput', PhoneInput)

const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
