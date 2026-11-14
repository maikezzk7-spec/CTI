<template>
  <header
    class="sticky top-0 z-30 border-b border-white/10
           bg-[#0B1220]/95 shadow-lg shadow-black/10
           backdrop-blur-xl"
  >
    <!-- Área principal -->
    <div
      class="flex min-h-20 items-center justify-between
             gap-3 px-4 py-3 sm:px-6 lg:px-8"
    >
      <!-- Lado esquerdo -->
      <div class="flex min-w-0 items-center gap-3">
        <!-- Menu mobile -->
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center
                 justify-center rounded-xl border
                 border-white/10 bg-white/5
                 text-slate-200 transition-colors
                 hover:bg-white/10 lg:hidden"
          aria-label="Abrir menu de navegação"
          @click="emit('abrir-menu')"
        >
          <i class="fa-solid fa-bars"></i>
        </button>

        <!-- Ícone da página -->
        <div
          class="hidden h-11 w-11 shrink-0 items-center
                 justify-center rounded-xl
                 bg-[#06B6D4]/15 text-[#22D3EE] sm:flex"
        >
          <i :class="iconePagina" class="text-lg"></i>
        </div>

        <!-- Título dinâmico -->
        <div class="min-w-0">
          <h1
            class="truncate text-base font-bold
                   tracking-tight text-white sm:text-lg"
          >
            {{ tituloPagina }}
          </h1>

          <p class="hidden text-xs text-slate-400 sm:block">
            {{ descricaoPagina }}
          </p>
        </div>
      </div>

      <!-- Lado direito -->
      <div class="flex shrink-0 items-center gap-3">
        <!-- Identificação CTI -->
        <div
          class="hidden items-center gap-2 rounded-full
                 border border-white/10 bg-white/5
                 px-3 py-2 lg:flex"
        >
          <span
            class="h-2 w-2 rounded-full bg-[#06B6D4]"
          ></span>

          <span class="text-xs font-medium text-slate-300">
            CTI Insights
          </span>
        </div>

        <!-- Divisor -->
        <div
          class="hidden h-8 w-px bg-white/10 sm:block"
        ></div>

        <!-- Usuário autenticado -->
        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p
              class="max-w-40 truncate text-sm
                     font-semibold text-white"
            >
              {{ nomeUsuario }}
            </p>

            <p class="text-xs text-slate-400">
              {{ perfilUsuario }}
            </p>
          </div>

          <!-- Avatar sincronizado com Sidebar -->
          <div
            class="flex h-10 w-10 shrink-0 items-center
                   justify-center overflow-hidden rounded-full
                   border-2 border-[#06B6D4]/40
                   bg-[#06B6D4] text-sm font-bold text-white"
            aria-label="Avatar do usuário"
          >
            <img
              v-if="avatarAtual"
              :src="avatarAtual"
              alt="Foto de perfil"
              class="h-full w-full object-cover"
            />

            <span v-else>{{ inicialUsuario }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div
      class="flex items-center gap-2 border-t border-white/10
             px-4 py-2 text-xs sm:px-6 lg:px-8"
    >
      <span class="font-medium text-slate-400">
        CTI Insights
      </span>

      <i
        class="fa-solid fa-chevron-right
               text-[9px] text-slate-600"
      ></i>

      <span class="font-semibold text-[#22D3EE]">
        {{ tituloPagina }}
      </span>
    </div>
  </header>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted
} from 'vue'

import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['abrir-menu'])

const route = useRoute()
const auth = useAuthStore()

// Configuração das páginas
const paginas = {
  '/app/upload': {
    titulo: 'Upload de dados',
    descricao: 'Importe e valide suas planilhas.',
    icone: 'fa-solid fa-cloud-arrow-up',
  },

  '/app/relatorios': {
    titulo: 'Relatórios',
    descricao: 'Acompanhe os resultados das validações.',
    icone: 'fa-solid fa-file-lines',
  },

  '/app/graficos': {
    titulo: 'Gráficos',
    descricao: 'Visualize seus indicadores e análises.',
    icone: 'fa-solid fa-chart-column',
  },

  '/app/perfil': {
    titulo: 'Meu perfil',
    descricao: 'Gerencie suas informações pessoais.',
    icone: 'fa-solid fa-user-gear',
  },
}

// Página atual
const paginaAtual = computed(() =>
  paginas[route.path] ?? {
    titulo: 'Painel de controle',
    descricao: 'Área de análise de dados.',
    icone: 'fa-solid fa-chart-pie',
  }
)

const tituloPagina = computed(() => paginaAtual.value.titulo)
const descricaoPagina = computed(() => paginaAtual.value.descricao)
const iconePagina = computed(() => paginaAtual.value.icone)

// Usuário autenticado
const usuario = computed(() => auth.usuario)

const nomeUsuario = computed(() =>
  usuario.value?.nome || 'Usuário'
)

const perfilUsuario = computed(() => {
  const perfil = usuario.value?.perfil

  if (perfil === 'ADMIN') return 'Administrador'
  if (perfil === 'ALUNO') return 'Aluno'
  if (perfil === 'PROFESSOR') return 'Professor'

  return perfil || 'Conta conectada'
})

const inicialUsuario = computed(() =>
  nomeUsuario.value.charAt(0).toUpperCase()
)

// Avatar salvo localmente
const chaveAvatar = computed(() => {
  const id = usuario.value?.id

  return id != null ? `cti-avatar-${id}` : null
})

const avatarAtual = ref(null)

// Carrega a foto do usuário atual
function carregarAvatar() {
  try {
    avatarAtual.value = chaveAvatar.value
      ? localStorage.getItem(chaveAvatar.value)
      : null
  } catch {
    avatarAtual.value = null
  }
}

// Atualiza ao trocar de usuário
watch(chaveAvatar, carregarAvatar, { immediate: true })

// Atualiza quando a Sidebar salva outra foto
function aoAtualizarAvatar(evento) {
  if (
    String(evento.detail?.usuarioId) ===
    String(usuario.value?.id)
  ) {
    carregarAvatar()
  }
}

// Registra e remove o evento
onMounted(() => {
  window.addEventListener(
    'cti-avatar-atualizado',
    aoAtualizarAvatar
  )
})

onUnmounted(() => {
  window.removeEventListener(
    'cti-avatar-atualizado',
    aoAtualizarAvatar
  )
})
</script>