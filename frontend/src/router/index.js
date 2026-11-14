import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CadastroView from '../views/CadastroView.vue'
import AppLayout from '../layouts/AppLayout.vue'
import UploadView from '../views/UploadView.vue'
import RelatoriosView from '../views/RelatoriosView.vue'
import GraficosView from '../views/GraficosView.vue'
import PerfilView from '../views/PerfilView.vue'

// Nova tela de Administração de Usuários
import AdminUsuariosView from '../views/AdminUsuariosView.vue'

// Guarda a posição de rolagem de cada tela.
// Os dados ficam somente na memória da aplicação.
const posicoesRolagem = new Map()

const rotasDashboard = new Set([
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
        meta: {
          requiresAdmin: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    // Prioriza a posição salva pelo histórico do navegador.
    if (savedPosition) {
      return savedPosition
    }

    // Guarda onde o usuário estava na tela anterior.
    if (ehRotaDashboard(from)) {
      posicoesRolagem.set(from.name, {
        left: window.scrollX,
        top: window.scrollY
      })
    }

    // Restaura a posição individual da tela de destino.
    if (ehRotaDashboard(to)) {
      return posicoesRolagem.get(to.name) || {
        left: 0,
        top: 0
      }
    }

    // Páginas públicas começam no topo.
    return {
      left: 0,
      top: 0
    }
  }
})

// Protege as rotas que exigem autenticação.
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Ao sair do dashboard, descarta as posições salvas
  // se o usuário não estiver mais autenticado.
  if (!auth.logado) {
    posicoesRolagem.clear()
  }

  const requerAutenticacao = to.matched.some(
    (route) => route.meta.requiresAuth
  )

  // Verifica se a rota exige perfil ADMIN.
  const requerAdministrador = to.matched.some(
    (route) => route.meta.requiresAdmin
  )

  if (!requerAutenticacao && !requerAdministrador) {
    return true
  }

  if (!auth.logado) {
    return { name: 'login' }
  }

  try {
    const sessaoValida = await auth.verificarSessao()

    if (!sessaoValida) {
      posicoesRolagem.clear()
      return { name: 'login' }
    }

    // Impede que usuários comuns acessem a administração.
    if (
      requerAdministrador &&
      auth.usuario?.perfil !== 'ADMIN'
    ) {
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