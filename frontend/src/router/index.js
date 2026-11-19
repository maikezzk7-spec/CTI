import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CadastroView from '../views/CadastroView.vue'

import AppLayout from '../layouts/AppLayout.vue'

import DashboardView from '../views/DashboardView.vue'
import ClientesView from '../views/ClientesView.vue'
import UploadView from '../views/UploadView.vue'
import RelatoriosView from '../views/RelatoriosView.vue'
import GraficosView from '../views/GraficosView.vue'
import PerfilView from '../views/PerfilView.vue'
import AdminUsuariosView from '../views/AdminUsuariosView.vue'

const posicoesRolagem = new Map()

const rotasDashboard = new Set([
  'dashboard',
  'clientes',
  'upload',
  'relatorios',
  'graficos',
  'perfil',
  'admin-usuarios'
])

function ehRotaDashboard(rota) {
  return rotasDashboard.has(rota.name)
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: CadastroView
  },
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    redirect: '/app/upload',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView
      },
      {
        path: 'clientes',
        name: 'clientes',
        component: ClientesView
      },
      {
        path: 'upload',
        name: 'upload',
        component: UploadView
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
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: PerfilView
      },
      {
        path: 'admin/usuarios',
        name: 'admin-usuarios',
        component: AdminUsuariosView,
        meta: { requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),

  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    if (ehRotaDashboard(from)) {
      posicoesRolagem.set(from.name, {
        left: window.scrollX,
        top: window.scrollY
      })
    }

    if (ehRotaDashboard(to)) {
      return posicoesRolagem.get(to.name) || {
        left: 0,
        top: 0
      }
    }

    return { left: 0, top: 0 }
  }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  const requerAutenticacao = to.matched.some(
    rota => rota.meta.requiresAuth
  )

  const requerAdministrador = to.matched.some(
    rota => rota.meta.requiresAdmin
  )

  if (!requerAutenticacao && !requerAdministrador) {
    return true
  }

  try {
    // Verifica a sessão no backend.
    // Funciona inclusive após atualizar a página.
    const sessaoValida = await auth.verificarSessao()

    if (!sessaoValida) {
      posicoesRolagem.clear()
      return { name: 'login' }
    }

    if (requerAdministrador && !auth.isAdmin) {
      return { name: 'upload' }
    }

    return true
  } catch (erro) {
    console.error(
      'Não foi possível verificar a sessão:',
      erro
    )

    return false
  }
})

export default router