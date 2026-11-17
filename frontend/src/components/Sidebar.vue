<template>
  <!-- Fundo escuro no celular -->
  <div
    v-if="menuMobileAberto"
    class="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
    @click="fecharMenuMobile"
  ></div>

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-60 flex-col
           border-r border-white/10 bg-slate-950 px-4 py-6
           text-white shadow-xl transition-transform duration-300
           lg:translate-x-0"
    :class="menuMobileAberto ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo CTI Insights -->
    <router-link
      to="/app/upload"
      class="mb-10 flex items-center gap-3 px-1"
      @click="fecharMenuMobile"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 44"
        fill="none"
        class="h-11 w-14 shrink-0"
        role="img"
        aria-label="Logo CTI Insights"
      >
        <path
          d="M18 36H13
             C6.5 36 3 31.5 3 25.5
             C3 19.5 7.5 15 14 14.5
             C15.5 7.5 21 3 28 3
             C34.5 3 39.5 6.5 42 12
             C44 10.5 46 10 48.5 10
             C55.5 10 61 15.5 61 22.5
             C61 29.5 56 36 48 36H18Z"
          stroke="#438DF6"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M22 28V21 M32 28V15 M42 28V16"
          stroke="#E8EDF3"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>

      <div class="whitespace-nowrap text-lg font-bold tracking-tight">
        CTI
        <span class="text-blue-400">INSIGHTS</span>
      </div>
    </router-link>

    <!-- Navegação -->
    <div
      class="mb-3 px-3 text-[11px] font-semibold uppercase
             tracking-[0.2em] text-slate-500"
    >
      Navegação
    </div>

    <nav class="flex flex-col gap-2">
      <router-link
        v-for="item in menus"
        :key="item.rota"
        :to="item.rota"
        class="group flex items-center gap-3 rounded-xl
               border border-transparent px-4 py-3
               text-sm font-medium text-slate-300
               transition-all duration-200
               hover:bg-white/10 hover:text-white"
        active-class="!border-[#06B6D4]/20 !bg-[#06B6D4]/15 !text-[#22D3EE]"
        @click="fecharMenuMobile"
      >
        <i
          :class="item.icone"
          class="w-5 text-center text-base"
          aria-hidden="true"
        ></i>

        <span>{{ item.nome }}</span>
      </router-link>
    </nav>

    <!-- Administração: visível somente para ADMIN -->
    <div v-if="ehAdministrador" class="mt-7">
      <div
        class="mb-3 px-3 text-[11px] font-semibold uppercase
               tracking-[0.2em] text-slate-500"
      >
        Administração
      </div>

      <nav class="flex flex-col gap-2" aria-label="Administração">
        <router-link
          to="/app/admin/usuarios"
          class="group flex items-center gap-3 rounded-xl
                 border border-transparent px-4 py-3
                 text-sm font-medium text-slate-300
                 transition-all duration-200
                 hover:bg-white/10 hover:text-white"
          active-class="!border-[#06B6D4]/20 !bg-[#06B6D4]/15 !text-[#22D3EE]"
          @click="fecharMenuMobile"
        >
          <i
            class="fa-solid fa-users-gear w-5 text-center text-base"
            aria-hidden="true"
          ></i>

          <span>Gerenciar usuários</span>
        </router-link>
      </nav>
    </div>

    <div class="flex-1"></div>

    <!-- Perfil do usuário -->
    <div class="relative border-t border-white/10 pt-4">
      <!-- Menu suspenso -->
      <div
        v-if="perfilAberto"
        class="absolute bottom-full left-0 right-0 mb-3
               overflow-hidden rounded-xl border border-slate-700
               bg-slate-950 p-2 shadow-2xl"
      >
        <div class="border-b border-white/10 px-3 py-3">
          <p class="truncate text-sm font-semibold text-white">
            {{ nomeUsuario }}
          </p>

          <p class="mt-1 truncate text-xs text-slate-400">
            {{ emailUsuario }}
          </p>
        </div>

        <!-- Meu Perfil -->
        <router-link
          to="/app/perfil"
          class="mt-2 flex w-full items-center gap-3 rounded-lg
                 px-3 py-3 text-left text-sm text-slate-200
                 transition-colors hover:bg-white/10"
          @click="perfilAberto = false"
        >
          <i
            class="fa-solid fa-user-pen w-5 text-center text-[#22D3EE]"
            aria-hidden="true"
          ></i>

          Meu Perfil
        </router-link>

        <!-- Personalizar foto -->
        <button
          type="button"
          class="mt-2 flex w-full items-center gap-3 rounded-lg
                 px-3 py-3 text-left text-sm text-slate-200
                 transition-colors hover:bg-white/10"
          @click="abrirPersonalizacao"
        >
          <i
            class="fa-solid fa-camera w-5 text-center text-[#22D3EE]"
            aria-hidden="true"
          ></i>

          Personalizar foto
        </button>

        <!-- Sair -->
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg
                 px-3 py-3 text-left text-sm text-red-300
                 transition-colors hover:bg-red-500/10"
          @click="sair"
        >
          <i
            class="fa-solid fa-right-from-bracket w-5 text-center"
            aria-hidden="true"
          ></i>

          Sair da conta
        </button>
      </div>

      <!-- Botão do perfil -->
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-xl
               border border-white/10 bg-slate-950 p-3
               text-left transition-all duration-200
               hover:border-[#06B6D4]/40 hover:bg-white/10"
        :aria-expanded="perfilAberto"
        aria-label="Abrir menu do perfil"
        @click="perfilAberto = !perfilAberto"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center
                 justify-center overflow-hidden rounded-full
                 bg-[#06B6D4] text-sm font-bold text-white"
        >
          <img
            v-if="avatarAtual"
            :src="avatarAtual"
            alt="Foto de perfil"
            class="h-full w-full object-cover"
          />

          <span v-else>{{ inicialUsuario }}</span>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-white">
            {{ nomeUsuario }}
          </p>

          <p class="truncate text-xs text-slate-400">
            {{ perfilUsuario }}
          </p>
        </div>

        <i
          class="fa-solid fa-chevron-up text-xs text-slate-400 transition-transform"
          :class="perfilAberto ? 'rotate-180' : ''"
          aria-hidden="true"
        ></i>
      </button>
    </div>
  </aside>

  <!-- Janela de personalização -->
  <div
    v-if="personalizacaoAberta"
    class="fixed inset-0 z-[100] flex items-center justify-center
           bg-slate-950/75 p-4"
    @click.self="fecharPersonalizacao"
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-personalizacao"
      class="w-full max-w-md rounded-2xl border border-slate-700
             bg-slate-950 p-6 text-white shadow-2xl"
    >
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h2
            id="titulo-personalizacao"
            class="text-lg font-bold"
          >
            Personalizar perfil
          </h2>

          <p class="mt-1 text-sm text-slate-400">
            Escolha sua foto ou um avatar.
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg p-2 text-slate-400 hover:bg-white/10"
          aria-label="Fechar"
          @click="fecharPersonalizacao"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Prévia -->
      <div class="mb-6 flex flex-col items-center gap-3">
        <div
          class="flex h-24 w-24 items-center justify-center
                 overflow-hidden rounded-full border-4
                 border-[#06B6D4]/40 bg-[#06B6D4]
                 text-3xl font-bold"
        >
          <img
            v-if="avatarPrevia"
            :src="avatarPrevia"
            alt="Prévia do avatar"
            class="h-full w-full object-cover"
          />

          <span v-else>{{ inicialUsuario }}</span>
        </div>

        <p class="font-semibold">{{ nomeUsuario }}</p>
      </div>

      <!-- Escolher foto -->
      <label
        for="foto-perfil"
        class="mb-5 flex cursor-pointer items-center justify-center
               gap-2 rounded-xl border border-dashed
               border-[#06B6D4]/60 px-4 py-3
               text-sm text-[#22D3EE]
               transition-colors hover:bg-[#06B6D4]/10"
      >
        <i class="fa-solid fa-camera"></i>
        Escolher foto do computador
      </label>

      <input
        id="foto-perfil"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class="sr-only"
        @change="selecionarFoto"
      />

      <p class="mb-4 text-xs text-slate-400">
        PNG, JPG ou WebP. Máximo de 2 MB.
      </p>

      <!-- Avatares prontos -->
      <p class="mb-3 text-sm font-semibold">
        Ou escolha um avatar
      </p>

      <div class="mb-5 grid grid-cols-4 gap-3">
        <button
          v-for="(avatar, index) in avatares"
          :key="index"
          type="button"
          class="aspect-square overflow-hidden rounded-full
                 border-2 transition-all hover:scale-105"
          :class="avatarPrevia === avatar
            ? 'border-[#22D3EE] ring-2 ring-[#06B6D4]/30'
            : 'border-transparent'"
          :aria-label="`Selecionar avatar ${index + 1}`"
          @click="selecionarAvatarPronto(avatar)"
        >
          <img
            :src="avatar"
            :alt="`Avatar ${index + 1}`"
            class="h-full w-full object-cover"
          />
        </button>
      </div>

      <button
        type="button"
        class="mb-5 text-sm text-slate-400 underline
               hover:text-white"
        @click="usarInicial"
      >
        Usar inicial do nome
      </button>

      <!-- Mensagem de erro -->
      <p
        v-if="erroFoto"
        role="alert"
        class="mb-4 text-sm text-red-300"
      >
        {{ erroFoto }}
      </p>

      <!-- Ações -->
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-xl border border-slate-700
                 px-4 py-3 text-sm hover:bg-white/10"
          @click="fecharPersonalizacao"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="flex-1 rounded-xl bg-[#06B6D4] px-4 py-3
                 text-sm font-semibold text-slate-950
                 hover:bg-[#0891B2]"
          :disabled="fotoCarregando"
          :class="fotoCarregando ? 'cursor-wait opacity-60' : ''"
          @click="salvarAvatar"
        >
          {{ fotoCarregando ? 'Carregando...' : 'Salvar' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted
} from 'vue'

import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  menuAberto: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fechar-menu'])

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Estados da interface
const perfilAberto = ref(false)
const personalizacaoAberta = ref(false)
const erroFoto = ref('')
const fotoCarregando = ref(false)

// Controle do menu mobile
const menuMobileAberto = computed(() => props.menuAberto)

// Navegação
const menus = [
  {
    nome: 'Upload',
    rota: '/app/upload',
    icone: 'fa-solid fa-cloud-arrow-up'
  },
  {
    nome: 'Relatórios',
    rota: '/app/relatorios',
    icone: 'fa-solid fa-file-lines'
  },
  {
    nome: 'Gráficos',
    rota: '/app/graficos',
    icone: 'fa-solid fa-chart-column'
  }
]

// Usuário autenticado
const usuario = computed(() => auth.usuario)

// A visibilidade do menu é apenas uma conveniência visual.
// A autorização real deve ser aplicada no router e no backend.
const ehAdministrador = computed(() =>
  usuario.value?.perfil === 'ADMIN'
)

const nomeUsuario = computed(() =>
  usuario.value?.nome || 'Usuário'
)

const emailUsuario = computed(() =>
  usuario.value?.email || ''
)

// Perfis reais do backend: USER e ADMIN
const perfilUsuario = computed(() => {
  const perfil = usuario.value?.perfil

  if (perfil === 'ADMIN') return 'Administrador'
  if (perfil === 'USER') return 'Usuário'

  return 'Conta conectada'
})

const inicialUsuario = computed(() =>
  nomeUsuario.value.charAt(0).toUpperCase()
)

// Avatar salvo localmente por usuário
const chaveAvatar = computed(() => {
  const id = usuario.value?.id

  return id != null ? `cti-avatar-${id}` : null
})

const avatarAtual = ref(null)
const avatarPrevia = ref(null)

// Controle da leitura de arquivos
let leitorFotoAtual = null
let versaoLeituraFoto = 0

function carregarAvatar() {
  try {
    avatarAtual.value = chaveAvatar.value
      ? localStorage.getItem(chaveAvatar.value)
      : null
  } catch {
    avatarAtual.value = null
  }
}

watch(
  chaveAvatar,
  () => carregarAvatar(),
  { immediate: true }
)

// Avatares SVG gerados localmente
const cores = [
  ['#06B6D4', '#101D32'],
  ['#438DF6', '#1E3A8A'],
  ['#7C3AED', '#101D32'],
  ['#0891B2', '#164E63']
]

const avatares = cores.map(([fundo, detalhe]) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="${fundo}"/>
      <circle cx="50" cy="37" r="19" fill="#F8FAFC"/>
      <path d="M16 100c2-27 15-40 34-40s32 13 34 40"
            fill="${detalhe}"/>
    </svg>
  `

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
})

// Cancela uma leitura de foto pendente
function cancelarLeituraFoto() {
  versaoLeituraFoto++

  if (leitorFotoAtual) {
    if (leitorFotoAtual.readyState === FileReader.LOADING) {
      leitorFotoAtual.abort()
    }

    leitorFotoAtual = null
  }

  fotoCarregando.value = false
}

// Abre a janela de personalização
function abrirPersonalizacao() {
  cancelarLeituraFoto()

  perfilAberto.value = false
  erroFoto.value = ''
  avatarPrevia.value = avatarAtual.value
  personalizacaoAberta.value = true
}

// Fecha a janela sem salvar alterações
function fecharPersonalizacao() {
  cancelarLeituraFoto()

  personalizacaoAberta.value = false
  erroFoto.value = ''
  avatarPrevia.value = avatarAtual.value
}

// Seleciona foto do computador
function selecionarFoto(evento) {
  cancelarLeituraFoto()
  erroFoto.value = ''

  const arquivo = evento.target.files?.[0]

  // Permite selecionar o mesmo arquivo novamente
  evento.target.value = ''

  if (!arquivo) return

  const tiposPermitidos = [
    'image/png',
    'image/jpeg',
    'image/webp'
  ]

  const tamanhoMaximo = 2 * 1024 * 1024

  if (!tiposPermitidos.includes(arquivo.type)) {
    erroFoto.value = 'Escolha uma imagem PNG, JPG ou WebP.'
    return
  }

  if (arquivo.size > tamanhoMaximo) {
    erroFoto.value = 'A imagem deve ter no máximo 2 MB.'
    return
  }

  const leitor = new FileReader()
  const versaoAtual = versaoLeituraFoto

  leitorFotoAtual = leitor
  fotoCarregando.value = true

  leitor.onload = () => {
    if (
      leitorFotoAtual !== leitor ||
      versaoAtual !== versaoLeituraFoto ||
      !personalizacaoAberta.value
    ) {
      return
    }

    if (typeof leitor.result === 'string') {
      avatarPrevia.value = leitor.result
    } else {
      erroFoto.value = 'Não foi possível carregar a imagem.'
    }

    leitorFotoAtual = null
    fotoCarregando.value = false
  }

  leitor.onerror = () => {
    if (
      leitorFotoAtual !== leitor ||
      versaoAtual !== versaoLeituraFoto
    ) {
      return
    }

    erroFoto.value = 'Não foi possível ler a imagem.'
    leitorFotoAtual = null
    fotoCarregando.value = false
  }

  leitor.onabort = () => {
    if (leitorFotoAtual === leitor) {
      leitorFotoAtual = null
      fotoCarregando.value = false
    }
  }

  try {
    leitor.readAsDataURL(arquivo)
  } catch {
    if (leitorFotoAtual === leitor) {
      leitorFotoAtual = null
      fotoCarregando.value = false
      erroFoto.value = 'Não foi possível abrir a imagem.'
    }
  }
}

// Seleciona um avatar pronto
function selecionarAvatarPronto(avatar) {
  cancelarLeituraFoto()

  erroFoto.value = ''
  avatarPrevia.value = avatar
}

// Remove a foto e utiliza a inicial do nome
function usarInicial() {
  cancelarLeituraFoto()

  erroFoto.value = ''
  avatarPrevia.value = null
}

// Salva o avatar no navegador
function salvarAvatar() {
  if (fotoCarregando.value) return

  cancelarLeituraFoto()

  if (!chaveAvatar.value) {
    erroFoto.value = 'Não foi possível identificar o usuário.'
    return
  }

  try {
    if (avatarPrevia.value) {
      localStorage.setItem(
        chaveAvatar.value,
        avatarPrevia.value
      )
    } else {
      localStorage.removeItem(chaveAvatar.value)
    }

    avatarAtual.value = avatarPrevia.value

    // Atualiza Header e PerfilView
    window.dispatchEvent(
      new CustomEvent('cti-avatar-atualizado', {
        detail: {
          usuarioId: usuario.value?.id
        }
      })
    )

    personalizacaoAberta.value = false
    erroFoto.value = ''
  } catch {
    erroFoto.value =
      'Não foi possível salvar a imagem neste navegador. Tente uma foto menor ou escolha um avatar.'
  }
}

// Fecha o menu mobile
function fecharMenuMobile() {
  emit('fechar-menu')
}

// Encerra a sessão no backend antes de redirecionar
async function sair() {
  cancelarLeituraFoto()

  perfilAberto.value = false
  personalizacaoAberta.value = false
  fecharMenuMobile()

  try {
    await auth.logout()
    await router.replace('/')
  } catch (erro) {
    console.error('Não foi possível encerrar a sessão:', erro)
    alert('Não foi possível encerrar a sessão no servidor. Tente novamente.')
  }
}

// Fecha os menus ao trocar de página
watch(
  () => route.fullPath,
  () => {
    perfilAberto.value = false
    fecharMenuMobile()
  }
)

// Evento enviado pela página Meu Perfil
function aoSolicitarPersonalizacao() {
  abrirPersonalizacao()
}

// Registra o evento
onMounted(() => {
  window.addEventListener(
    'cti-abrir-personalizacao',
    aoSolicitarPersonalizacao
  )
})

// Remove o evento e cancela leituras pendentes
onUnmounted(() => {
  cancelarLeituraFoto()

  window.removeEventListener(
    'cti-abrir-personalizacao',
    aoSolicitarPersonalizacao
  )
})
</script>