import { createRouter, createWebHistory } from 'vue-router'

// Paginas Públicas
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

// Layout do Painel
import AppLayout from '../layouts/AppLayout.vue'

//Páginas Internas
import UploadView from '../views/UploadView.vue'
import RelatoriosView from '../views/RelatoriosView.vue'
import GraficosView from '../views/GraficosView.vue'

const routes = [
    //Páginas inicial
    {
        path:'/',
        name:'home',
        component: HomeView
    },

    //Login
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },

    // Painel interno
    {
        path: '/app',
        component: AppLayout,
        redirect:'/app/uploud',

        Children:[
            {
                path: 'upload',
                name: 'upload',
                component:UploadView
            },

            {
                path: 'relatorios',
                name: 'relatorios',
                component: RelatoriosView
            },

            {
                path: 'graficos',
                name: 'graficos',
                component: GraficosView
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
})

export default router