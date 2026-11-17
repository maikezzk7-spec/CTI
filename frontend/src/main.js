import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)
const pinia = createPinia()

// O Pinia precisa estar disponível antes dos guards do Router.
app.use(pinia)

// O Router pode acessar as stores normalmente.
app.use(router)

app.mount('#app')