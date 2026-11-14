<template>
  <div class="mx-auto w-full max-w-6xl space-y-6 text-white">
    <!-- Apresentação -->
    <div>
      <div class="mb-3 flex items-center gap-2 text-sm text-[#22D3EE]">
        <i class="fa-solid fa-user-gear"></i>
        Minha conta
      </div>

      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Meu Perfil
      </h1>

      <p class="mt-2 text-slate-400">
        Consulte suas informações e personalize sua experiência
        no CTI Insights.
      </p>
    </div>

    <!-- Cartão principal -->
    <section
      class="overflow-hidden rounded-2xl border border-white/10
             bg-[#18263E] shadow-xl shadow-black/10"
    >
      <!-- Faixa superior -->
      <div
        class="h-28 bg-gradient-to-r
               from-[#102D46] via-[#12445B] to-[#0B1220]"
      ></div>

      <div class="px-5 pb-6 sm:px-8">
        <div
          class="-mt-10 flex flex-col gap-4 sm:flex-row
                 sm:items-end sm:justify-between"
        >
          <!-- Avatar -->
          <div
            class="flex h-20 w-20 shrink-0 items-center
                   justify-center overflow-hidden rounded-full
                   border-4 border-[#18263E] bg-[#06B6D4]
                   text-2xl font-bold text-white shadow-lg"
          >
            <img
              v-if="avatarAtual"
              :src="avatarAtual"
              alt="Foto de perfil"
              class="h-full w-full object-cover"
            />

            <span v-else>{{ inicialUsuario }}</span>
          </div>

          <!-- Botão personalizar foto -->
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2
                   rounded-xl bg-[#06B6D4] px-4 py-3
                   text-sm font-semibold text-slate-950
                   transition-colors hover:bg-[#0891B2]"
            @click="personalizarPerfil"
          >
            <i class="fa-solid fa-camera"></i>
            Personalizar foto
          </button>
        </div>

        <!-- Dados principais -->
        <div class="mt-4">
          <h2 class="text-xl font-bold">
            {{ nomeUsuario }}
          </h2>

          <p class="mt-1 text-sm text-slate-400">
            {{ emailUsuario }}
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <!-- Perfil de acesso -->
            <span
              class="rounded-full border border-[#06B6D4]/30
                     bg-[#06B6D4]/10 px-3 py-1
                     text-xs font-semibold text-[#22D3EE]"
            >
              {{ perfilUsuario }}
            </span>

            <!-- Status com cor dinâmica -->
            <span
              class="inline-flex items-center gap-2 rounded-full
                     border px-3 py-1 text-xs font-semibold"
              :class="classeStatus"
            >
              <i :class="iconeStatus" aria-hidden="true"></i>
              {{ statusUsuario }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Informações pessoais -->
    <section
      class="rounded-2xl border border-white/10
             bg-[#18263E] p-5 sm:p-8"
    >
      <div class="mb-6 flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center
                 rounded-xl bg-[#06B6D4]/10 text-[#22D3EE]"
        >
          <i class="fa-solid fa-address-card text-lg"></i>
        </div>

        <div>
          <h2 class="text-lg font-bold">
            Informações pessoais
          </h2>

          <p class="text-sm text-slate-400">
            Dados associados à sua conta.
          </p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="campo in camposPerfil"
          :key="campo.rotulo"
          class="rounded-xl border border-white/10
                 bg-[#0B1220]/50 p-4"
        >
          <p class="mb-2 text-xs font-medium text-slate-400">
            {{ campo.rotulo }}
          </p>

          <div class="flex items-center gap-3">
            <i
              :class="campo.icone"
              class="w-5 text-center text-[#22D3EE]"
              aria-hidden="true"
            ></i>

            <p class="min-w-0 break-words text-sm font-semibold">
              {{ campo.valor }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Segurança da conta -->
    <section
      class="rounded-2xl border border-white/10
             bg-[#18263E] p-5 sm:p-8"
    >
      <div class="flex items-start gap-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center
                 justify-center rounded-xl
                 bg-[#06B6D4]/10 text-[#22D3EE]"
        >
          <i class="fa-solid fa-shield-halved text-lg"></i>
        </div>

        <div>
          <h2 class="text-lg font-bold">
            Segurança da conta
          </h2>

          <p class="mt-2 text-sm leading-6 text-slate-400">
            Sua sessão é protegida pela autenticação do CTI Insights.
            Futuramente, esta área permitirá atualizar sua senha
            e gerenciar informações da conta com validação
            pelo servidor.
          </p>
        </div>
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

import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

// Dados do usuário autenticado
const usuario = computed(() => auth.usuario)

const nomeUsuario = computed(() =>
  usuario.value?.nome || 'Usuário'
)

const emailUsuario = computed(() =>
  usuario.value?.email || 'Não informado'
)

// Perfis reais do backend: ADMIN e USER
const perfilUsuario = computed(() => {
  const perfil = usuario.value?.perfil

  if (perfil === 'ADMIN') return 'Administrador'
  if (perfil === 'USER') return 'Usuário'

  return perfil || 'Não informado'
})

// Status reais do backend
const statusUsuario = computed(() => {
  const status = usuario.value?.status

  if (status === 'APROVADO') return 'Conta aprovada'
  if (status === 'PENDENTE') return 'Aguardando aprovação'
  if (status === 'BLOQUEADO') return 'Conta bloqueada'

  return 'Não informado'
})

// Cores de cada status
const classeStatus = computed(() => {
  const status = usuario.value?.status

  if (status === 'APROVADO') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  }

  if (status === 'PENDENTE') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
  }

  if (status === 'BLOQUEADO') {
    return 'border-red-500/30 bg-red-500/10 text-red-300'
  }

  return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
})

// Ícones de cada status
const iconeStatus = computed(() => {
  const status = usuario.value?.status

  if (status === 'APROVADO') {
    return 'fa-solid fa-circle-check'
  }

  if (status === 'PENDENTE') {
    return 'fa-solid fa-clock'
  }

  if (status === 'BLOQUEADO') {
    return 'fa-solid fa-circle-xmark'
  }

  return 'fa-solid fa-circle-question'
})

// Inicial do nome
const inicialUsuario = computed(() =>
  nomeUsuario.value.charAt(0).toUpperCase()
)

// Informações exibidas nos cards
const camposPerfil = computed(() => [
  {
    rotulo: 'Nome completo',
    valor: nomeUsuario.value,
    icone: 'fa-solid fa-user'
  },
  {
    rotulo: 'E-mail',
    valor: emailUsuario.value,
    icone: 'fa-solid fa-envelope'
  },
  {
    rotulo: 'Matrícula',
    valor: usuario.value?.matricula || 'Não informada',
    icone: 'fa-solid fa-id-card'
  },
  {
    rotulo: 'Turma',
    valor: usuario.value?.turma || 'Não informada',
    icone: 'fa-solid fa-graduation-cap'
  },
  {
    rotulo: 'Perfil de acesso',
    valor: perfilUsuario.value,
    icone: 'fa-solid fa-user-shield'
  },
  {
    rotulo: 'Status da conta',
    valor: statusUsuario.value,
    icone: 'fa-solid fa-circle-check'
  }
])

// Avatar local, compatível com Sidebar e Header
const chaveAvatar = computed(() => {
  const id = usuario.value?.id
  return id != null ? `cti-avatar-${id}` : null
})

const avatarAtual = ref(null)

// Carrega a foto salva no navegador
function carregarAvatar() {
  try {
    avatarAtual.value = chaveAvatar.value
      ? localStorage.getItem(chaveAvatar.value)
      : null
  } catch {
    avatarAtual.value = null
  }
}

watch(chaveAvatar, carregarAvatar, { immediate: true })

// Atualiza quando a Sidebar salva uma foto
function aoAtualizarAvatar(evento) {
  if (
    usuario.value?.id != null &&
    String(evento.detail?.usuarioId) ===
    String(usuario.value.id)
  ) {
    carregarAvatar()
  }
}

// Solicita que a Sidebar abra a personalização
function personalizarPerfil() {
  window.dispatchEvent(
    new CustomEvent('cti-abrir-personalizacao')
  )
}

// Registra o evento de atualização do avatar
onMounted(() => {
  window.addEventListener(
    'cti-avatar-atualizado',
    aoAtualizarAvatar
  )
})

// Remove o evento ao sair da página
onUnmounted(() => {
  window.removeEventListener(
    'cti-avatar-atualizado',
    aoAtualizarAvatar
  )
})
</script>