<template>
  <div class="mx-auto w-full max-w-7xl space-y-6 text-white">
    <!-- Apresentação -->
    <div>
      <div class="mb-3 flex items-center gap-2 text-sm text-[#22D3EE]">
        <i class="fa-solid fa-users-gear"></i>
        Painel administrativo
      </div>

      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Administração de Usuários
      </h1>

      <p class="mt-2 text-slate-400">
        Gerencie cadastros, acompanhe solicitações e controle
        o acesso dos usuários ao CTI Insights.
      </p>
    </div>

    <!-- Indicadores compactos -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="(card, index) in indicadores"
        :key="card.titulo"
        class="card-indicador rounded-2xl border border-white/10
               bg-[#18263E] p-4"
        :style="{ animationDelay: `${index * 90}ms` }"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="pt-1 text-sm text-slate-400">
            {{ card.titulo }}
          </p>

          <div
            class="icone-indicador flex h-11 w-11 shrink-0
                   items-center justify-center rounded-xl"
            :class="card.fundo"
          >
            <i
              :class="[card.icone, card.cor]"
              class="text-lg"
            ></i>
          </div>
        </div>

        <p
          class="mt-2 text-3xl font-extrabold tracking-tight"
          :class="card.cor"
        >
          {{ card.valor }}
        </p>

        <p class="mt-3 text-xs text-slate-400">
          {{ card.descricao }}
        </p>
      </div>
    </div>

    <!-- Listagem -->
    <section
      class="overflow-hidden rounded-2xl border border-white/10
             bg-[#18263E]"
    >
      <div class="border-b border-white/10 p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold">
              Usuários cadastrados
            </h2>

            <p class="mt-1 text-sm text-slate-400">
              Consulte os usuários e gerencie suas permissões.
            </p>
          </div>

          <button
            type="button"
            :disabled="carregando || alterando"
            class="inline-flex items-center gap-2 rounded-xl
                   border border-white/10 bg-white/5 px-4 py-2.5
                   text-sm font-semibold transition hover:bg-white/10
                   disabled:cursor-not-allowed disabled:opacity-50"
            @click="carregarUsuarios"
          >
            <i
              class="fa-solid fa-rotate"
              :class="{ 'fa-spin': carregando }"
            ></i>
            Atualizar
          </button>
        </div>

        <!-- Pesquisa e filtro -->
        <div class="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <div class="relative">
            <i
              class="fa-solid fa-magnifying-glass absolute left-4
                     top-1/2 -translate-y-1/2 text-slate-400"
            ></i>

            <input
              v-model="pesquisa"
              type="search"
              placeholder="Pesquisar por nome ou e-mail..."
              class="w-full rounded-xl border border-white/10
                     bg-[#0B1220] py-3 pl-11 pr-4 text-sm
                     text-white outline-none transition
                     placeholder:text-slate-500
                     focus:border-[#06B6D4]"
            />
          </div>

          <!-- Dropdown personalizado -->
          <div ref="dropdownStatusRef" class="relative">
            <button
              type="button"
              aria-label="Filtrar usuários por status"
              aria-haspopup="listbox"
              :aria-expanded="dropdownAberto"
              class="flex w-full items-center justify-between
                     rounded-xl border bg-[#0B1220] px-4 py-3
                     text-left text-sm text-white transition-all
                     hover:border-cyan-500/40
                     focus-visible:outline-none
                     focus-visible:ring-2
                     focus-visible:ring-cyan-400/60"
              :class="dropdownAberto
                ? 'border-cyan-400/60'
                : 'border-white/10'"
              @click="alternarDropdown"
              @keydown.esc.stop="fecharDropdown"
              @keydown.down.prevent="abrirDropdownPeloTeclado"
              @keydown.up.prevent="abrirDropdownPeloTeclado"
            >
              <span>{{ rotuloFiltroStatus }}</span>

              <i
                class="fa-solid fa-chevron-down text-xs
                       text-cyan-400 transition-transform duration-200"
                :class="{ 'rotate-180': dropdownAberto }"
              ></i>
            </button>

            <Transition name="dropdown">
              <div
                v-if="dropdownAberto"
                role="listbox"
                aria-label="Opções de status"
                class="absolute left-0 right-0 top-full z-50 mt-2
                       overflow-hidden rounded-xl border
                       border-cyan-500/20 bg-[#101D32]
                       p-1.5 shadow-2xl shadow-black/40"
                @keydown.esc.stop.prevent="fecharDropdown"
                @keydown.down.prevent="moverFocoOpcao(1)"
                @keydown.up.prevent="moverFocoOpcao(-1)"
                @keydown.home.prevent="focarOpcao(0)"
                @keydown.end.prevent="focarOpcao(opcoesStatus.length - 1)"
              >
                <button
                  v-for="opcao in opcoesStatus"
                  :key="opcao.valor"
                  :ref="el => registrarOpcao(el, opcao.valor)"
                  type="button"
                  role="option"
                  :aria-selected="filtroStatus === opcao.valor"
                  class="flex w-full items-center justify-between
                         rounded-lg px-3 py-3 text-left text-sm
                         transition-colors duration-150
                         focus-visible:outline-none
                         focus-visible:ring-2
                         focus-visible:ring-cyan-400/60"
                  :class="filtroStatus === opcao.valor
                    ? 'bg-cyan-500/15 font-semibold text-cyan-300'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'"
                  @click="selecionarStatus(opcao.valor)"
                >
                  <span class="flex items-center gap-3">
                    <i
                      :class="opcao.icone"
                      class="w-4 text-center"
                    ></i>
                    {{ opcao.rotulo }}
                  </span>

                  <i
                    v-if="filtroStatus === opcao.valor"
                    class="fa-solid fa-check text-cyan-400"
                  ></i>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Mensagem de erro -->
      <div
        v-if="erro"
        role="alert"
        class="mx-5 mt-5 rounded-xl border border-red-500/30
               bg-red-500/10 p-4 text-sm text-red-300"
      >
        <i class="fa-solid fa-circle-exclamation mr-2"></i>
        {{ erro }}
      </div>

      <!-- Carregamento -->
      <div
        v-if="carregando"
        class="flex min-h-52 flex-col items-center
               justify-center gap-3"
      >
        <i
          class="fa-solid fa-spinner fa-spin
                 text-3xl text-[#22D3EE]"
        ></i>

        <p class="text-sm text-slate-400">
          Carregando usuários...
        </p>
      </div>

      <!-- Tabela -->
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] text-left text-sm">
            <thead
              class="bg-[#0B1220]/60 text-xs
                     uppercase text-slate-400"
            >
              <tr>
                <th class="px-5 py-4 font-semibold">Usuário</th>
                <th class="px-5 py-4 font-semibold">Matrícula / Turma</th>
                <th class="px-5 py-4 font-semibold">Perfil</th>
                <th class="px-5 py-4 font-semibold">Status</th>
                <th class="px-5 py-4 font-semibold">Cadastro</th>
                <th class="px-5 py-4 text-right font-semibold">Ações</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-white/10">
              <tr
                v-for="item in usuariosFiltrados"
                :key="item.id"
                class="transition-colors hover:bg-white/[0.03]"
              >
                <!-- Usuário e foto -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-11 w-11 shrink-0 items-center
                             justify-center overflow-hidden rounded-full
                             border border-cyan-500/30 bg-[#164E63]
                             font-bold text-[#67E8F9]"
                    >
                      <img
                        v-if="avatares[String(item.id)]"
                        :src="avatares[String(item.id)]"
                        :alt="`Foto de ${item.nome}`"
                        class="h-full w-full object-cover"
                      />

                      <span v-else>
                        {{ inicial(item.nome) }}
                      </span>
                    </div>

                    <div class="min-w-0">
                      <p class="font-semibold text-white">
                        {{ item.nome }}
                      </p>

                      <p class="mt-1 text-xs text-slate-400">
                        {{ item.email }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="px-5 py-4 text-slate-300">
                  <p>{{ item.matricula || 'Não informada' }}</p>
                  <p class="mt-1 text-xs text-slate-400">
                    {{ item.turma || 'Turma não informada' }}
                  </p>
                </td>

                <td class="px-5 py-4">
                  <span
                    class="rounded-full border border-cyan-500/30
                           bg-cyan-500/10 px-3 py-1 text-xs
                           font-semibold text-cyan-300"
                  >
                    {{ textoPerfil(item.perfil) }}
                  </span>
                </td>

                <td class="px-5 py-4">
                  <span
                    class="inline-flex items-center gap-2 rounded-full
                           border px-3 py-1 text-xs font-semibold"
                    :class="classeStatus(item.status)"
                  >
                    <i :class="iconeStatus(item.status)"></i>
                    {{ textoStatus(item.status) }}
                  </span>
                </td>

                <td class="px-5 py-4 text-slate-300">
                  {{ formatarData(item.criadoEm) }}
                </td>

                <td class="px-5 py-4">
                  <div
                    v-if="String(item.id) !== String(auth.usuario?.id)"
                    class="flex justify-end gap-2"
                  >
                    <button
                      v-if="item.status !== 'APROVADO'"
                      type="button"
                      :disabled="alterando || carregando"
                      class="rounded-lg border border-emerald-500/30
                             bg-emerald-500/10 px-3 py-2 text-xs
                             font-semibold text-emerald-300
                             transition hover:bg-emerald-500/20
                             disabled:opacity-50"
                      @click="abrirConfirmacao(item, 'APROVADO')"
                    >
                      <i class="fa-solid fa-check mr-1"></i>
                      {{ item.status === 'BLOQUEADO'
                        ? 'Reativar'
                        : 'Aprovar' }}
                    </button>

                    <button
                      v-if="item.status !== 'BLOQUEADO'"
                      type="button"
                      :disabled="alterando || carregando"
                      class="rounded-lg border border-red-500/30
                             bg-red-500/10 px-3 py-2 text-xs
                             font-semibold text-red-300
                             transition hover:bg-red-500/20
                             disabled:opacity-50"
                      @click="abrirConfirmacao(item, 'BLOQUEADO')"
                    >
                      <i class="fa-solid fa-ban mr-1"></i>
                      Bloquear
                    </button>
                  </div>

                  <span
                    v-else
                    class="block text-right text-xs text-slate-500"
                  >
                    Sua conta
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sem resultados -->
        <div
          v-if="!erro && usuariosFiltrados.length === 0"
          class="flex flex-col items-center gap-3 px-5 py-12 text-center"
        >
          <i class="fa-solid fa-users-slash text-3xl text-slate-500"></i>

          <p class="font-semibold">
            Nenhum usuário encontrado
          </p>

          <p class="text-sm text-slate-400">
            Tente ajustar os filtros ou a pesquisa.
          </p>
        </div>

        <!-- Rodapé -->
        <div
          class="flex flex-wrap justify-between gap-2 border-t
                 border-white/10 px-5 py-4 text-xs text-slate-400"
        >
          <span>
            Exibindo {{ usuariosFiltrados.length }} usuário(s)
          </span>

          <span>
            Total cadastrado: {{ usuarios.length }}
          </span>
        </div>
      </template>
    </section>

    <!-- Modal de confirmação -->
    <div
      v-if="confirmacao"
      class="fixed inset-0 z-[100] flex items-center
             justify-center bg-black/75 p-4"
      role="presentation"
      @click.self="fecharConfirmacao"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacao"
        class="w-full max-w-md rounded-2xl border
               border-white/10 bg-[#18263E] p-6 shadow-2xl"
      >
        <div
          class="mb-4 flex h-12 w-12 items-center
                 justify-center rounded-xl"
          :class="confirmacao.status === 'BLOQUEADO'
            ? 'bg-red-500/10 text-red-300'
            : 'bg-emerald-500/10 text-emerald-300'"
        >
          <i
            :class="confirmacao.status === 'BLOQUEADO'
              ? 'fa-solid fa-ban'
              : 'fa-solid fa-user-check'"
            class="text-xl"
          ></i>
        </div>

        <h2 id="titulo-confirmacao" class="text-xl font-bold">
          {{ tituloConfirmacao }}
        </h2>

        <p class="mt-3 text-sm leading-6 text-slate-400">
          Deseja realmente alterar o status de
          <strong class="text-white">
            {{ confirmacao.usuario.nome }}
          </strong>
          para
          <strong class="text-white">
            {{ textoStatus(confirmacao.status) }}
          </strong>?
        </p>

        <p
          v-if="confirmacao.status === 'BLOQUEADO'"
          class="mt-3 text-xs text-amber-300"
        >
          O bloqueio impedirá novos logins.
          A revogação de sessões existentes depende
          da validação do JWT no backend.
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            :disabled="alterando"
            class="rounded-xl border border-white/10
                   px-4 py-2.5 text-sm font-semibold
                   transition hover:bg-white/5
                   disabled:opacity-50"
            @click="fecharConfirmacao"
          >
            Cancelar
          </button>

          <button
            type="button"
            :disabled="alterando"
            class="rounded-xl px-4 py-2.5 text-sm
                   font-bold text-white transition
                   disabled:opacity-50"
            :class="confirmacao.status === 'BLOQUEADO'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-emerald-600 hover:bg-emerald-700'"
            @click="confirmarAlteracao"
          >
            <i
              v-if="alterando"
              class="fa-solid fa-spinner fa-spin mr-2"
            ></i>
            Confirmar
          </button>
        </div>
      </section>
    </div>

    <!-- Mensagem de sucesso -->
    <div
      v-if="sucesso"
      role="status"
      class="fixed bottom-5 right-5 z-[110]
             max-w-sm rounded-xl border border-emerald-500/30
             bg-[#12352F] p-4 text-sm font-semibold
             text-emerald-200 shadow-xl"
    >
      <i class="fa-solid fa-circle-check mr-2"></i>
      {{ sucesso }}
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref
} from 'vue'

import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'

const auth = useAuthStore()

const usuarios = ref([])
const pesquisa = ref('')
const filtroStatus = ref('TODOS')

const carregando = ref(false)
const alterando = ref(false)

const erro = ref('')
const sucesso = ref('')
const confirmacao = ref(null)

// ======================================================
// DROPDOWN PERSONALIZADO
// ======================================================

const dropdownAberto = ref(false)
const dropdownStatusRef = ref(null)
const opcoesRefs = new Map()

const opcoesStatus = [
  {
    valor: 'TODOS',
    rotulo: 'Todos os status',
    icone: 'fa-solid fa-layer-group'
  },
  {
    valor: 'PENDENTE',
    rotulo: 'Pendentes',
    icone: 'fa-solid fa-clock'
  },
  {
    valor: 'APROVADO',
    rotulo: 'Aprovados',
    icone: 'fa-solid fa-circle-check'
  },
  {
    valor: 'BLOQUEADO',
    rotulo: 'Bloqueados',
    icone: 'fa-solid fa-ban'
  }
]

const rotuloFiltroStatus = computed(() => {
  const opcao = opcoesStatus.find(
    item => item.valor === filtroStatus.value
  )

  return opcao?.rotulo || 'Todos os status'
})

function registrarOpcao(elemento, valor) {
  if (elemento) {
    opcoesRefs.set(valor, elemento)
  } else {
    opcoesRefs.delete(valor)
  }
}

async function focarOpcao(indice) {
  await nextTick()

  const indiceValido = Math.max(
    0,
    Math.min(indice, opcoesStatus.length - 1)
  )

  const valor = opcoesStatus[indiceValido]?.valor

  opcoesRefs.get(valor)?.focus()
}

function moverFocoOpcao(direcao) {
  const elementoAtivo = document.activeElement

  const indiceAtual = opcoesStatus.findIndex(
    opcao => opcoesRefs.get(opcao.valor) === elementoAtivo
  )

  const proximoIndice = indiceAtual < 0
    ? 0
    : (indiceAtual + direcao + opcoesStatus.length) %
      opcoesStatus.length

  focarOpcao(proximoIndice)
}

function alternarDropdown() {
  dropdownAberto.value = !dropdownAberto.value
}

async function abrirDropdownPeloTeclado() {
  if (!dropdownAberto.value) {
    dropdownAberto.value = true
  }

  const indice = opcoesStatus.findIndex(
    opcao => opcao.valor === filtroStatus.value
  )

  await focarOpcao(indice >= 0 ? indice : 0)
}

function selecionarStatus(status) {
  filtroStatus.value = status
  dropdownAberto.value = false
}

function fecharDropdown() {
  dropdownAberto.value = false
  dropdownStatusRef.value?.querySelector('button')?.focus()
}

function fecharDropdownFora(evento) {
  if (
    dropdownStatusRef.value &&
    !dropdownStatusRef.value.contains(evento.target)
  ) {
    dropdownAberto.value = false
  }
}

function fecharDropdownEscape(evento) {
  if (evento.key === 'Escape' && dropdownAberto.value) {
    fecharDropdown()
  }
}

// ======================================================
// AVATARES LOCAIS
// ======================================================

const avatares = ref({})

function carregarAvatares() {
  const fotos = {}

  for (const usuario of usuarios.value) {
    try {
      const foto = localStorage.getItem(
        `cti-avatar-${usuario.id}`
      )

      if (foto) {
        fotos[String(usuario.id)] = foto
      }
    } catch {
      // Se não houver armazenamento disponível,
      // mostramos a inicial do nome.
    }
  }

  avatares.value = fotos
}

function aoAtualizarAvatar(evento) {
  if (evento.detail?.usuarioId != null) {
    carregarAvatares()
  }
}

// ======================================================
// COMUNICAÇÃO COM O BACKEND
// ======================================================

// Utiliza o Axios configurado no services/api.js.
// O interceptor adiciona o token JWT automaticamente.
async function requisitar(caminho, opcoes = {}) {
  try {
    const resposta = await api({
      url: caminho,
      ...opcoes
    })

    return resposta.data
  } catch (e) {
    const dadosErro = e.response?.data

    const mensagem =
      dadosErro?.mensagem ||
      dadosErro?.message ||
      (typeof dadosErro === 'string' ? dadosErro : null) ||
      e.message ||
      'Não foi possível comunicar com o servidor.'

    throw new Error(mensagem)
  }
}

async function carregarUsuarios() {
  if (carregando.value || alterando.value) return

  carregando.value = true
  erro.value = ''
  sucesso.value = ''

  try {
    const dados = await requisitar('/admin/usuarios')

    if (!Array.isArray(dados)) {
      throw new Error('A API retornou uma lista inválida.')
    }

    usuarios.value = dados
    carregarAvatares()
  } catch (e) {
    erro.value =
      e.message || 'Não foi possível carregar os usuários.'

    usuarios.value = []
    avatares.value = {}
  } finally {
    carregando.value = false
  }
}

// ======================================================
// PESQUISA E FILTROS
// ======================================================

const usuariosFiltrados = computed(() => {
  const termo = pesquisa.value
    .trim()
    .toLocaleLowerCase('pt-BR')

  return usuarios.value.filter((item) => {
    const correspondeStatus =
      filtroStatus.value === 'TODOS' ||
      item.status === filtroStatus.value

    const correspondePesquisa =
      !termo ||
      (item.nome || '')
        .toLocaleLowerCase('pt-BR')
        .includes(termo) ||
      (item.email || '')
        .toLocaleLowerCase('pt-BR')
        .includes(termo)

    return correspondeStatus && correspondePesquisa
  })
})

// ======================================================
// INDICADORES COMPACTOS
// ======================================================

const indicadores = computed(() => [
  {
    titulo: 'Total de usuários',
    valor: usuarios.value.length,
    descricao: 'Contas cadastradas no sistema',
    icone: 'fa-solid fa-users',
    cor: 'text-cyan-400',
    fundo: 'bg-cyan-500/10'
  },
  {
    titulo: 'Aprovados',
    valor: usuarios.value.filter(
      u => u.status === 'APROVADO'
    ).length,
    descricao: 'Usuários com acesso liberado',
    icone: 'fa-solid fa-circle-check',
    cor: 'text-emerald-400',
    fundo: 'bg-emerald-500/10'
  },
  {
    titulo: 'Pendentes',
    valor: usuarios.value.filter(
      u => u.status === 'PENDENTE'
    ).length,
    descricao: 'Aguardando aprovação',
    icone: 'fa-solid fa-clock',
    cor: 'text-amber-400',
    fundo: 'bg-amber-500/10'
  },
  {
    titulo: 'Bloqueados',
    valor: usuarios.value.filter(
      u => u.status === 'BLOQUEADO'
    ).length,
    descricao: 'Contas com acesso bloqueado',
    icone: 'fa-solid fa-ban',
    cor: 'text-rose-400',
    fundo: 'bg-rose-500/10'
  }
])

// ======================================================
// FORMATAÇÃO
// ======================================================

function inicial(nome) {
  return (nome || 'U').charAt(0).toUpperCase()
}

function textoPerfil(perfil) {
  if (perfil === 'ADMIN') return 'Administrador'
  if (perfil === 'USER') return 'Usuário'
  return 'Não informado'
}

function textoStatus(status) {
  if (status === 'APROVADO') return 'Aprovado'
  if (status === 'PENDENTE') return 'Pendente'
  if (status === 'BLOQUEADO') return 'Bloqueado'
  return 'Desconhecido'
}

function classeStatus(status) {
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
}

function iconeStatus(status) {
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
}

function formatarData(data) {
  if (!data) return 'Não informada'

  const convertida = new Date(data)

  if (Number.isNaN(convertida.getTime())) {
    return 'Data inválida'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(convertida)
}

// ======================================================
// MODAL DE CONFIRMAÇÃO
// ======================================================

function abrirConfirmacao(usuario, status) {
  if (alterando.value || carregando.value) return

  if (String(usuario.id) === String(auth.usuario?.id)) {
    return
  }

  confirmacao.value = { usuario, status }
  erro.value = ''
  sucesso.value = ''
}

function fecharConfirmacao() {
  if (!alterando.value) {
    confirmacao.value = null
  }
}

const tituloConfirmacao = computed(() => {
  if (!confirmacao.value) return ''

  if (confirmacao.value.status === 'BLOQUEADO') {
    return 'Bloquear usuário'
  }

  if (confirmacao.value.usuario.status === 'BLOQUEADO') {
    return 'Reativar usuário'
  }

  return 'Aprovar usuário'
})

// ======================================================
// ALTERAÇÃO DE STATUS
// ======================================================

async function confirmarAlteracao() {
  if (!confirmacao.value || alterando.value) return

  const { usuario, status } = confirmacao.value

  if (String(usuario.id) === String(auth.usuario?.id)) {
    return
  }

  alterando.value = true
  erro.value = ''
  sucesso.value = ''

  let alteracaoConcluida = false

  try {
    await requisitar(`/admin/usuarios/${usuario.id}/status`, {
      method: 'PATCH',
      data: { status }
    })

    alteracaoConcluida = true
    confirmacao.value = null

    // Recarrega os dados oficiais do backend.
    const dados = await requisitar('/admin/usuarios')

    if (!Array.isArray(dados)) {
      throw new Error('A API retornou uma lista inválida.')
    }

    usuarios.value = dados
    carregarAvatares()

    sucesso.value =
      `Status de ${usuario.nome} atualizado com sucesso.`
  } catch (e) {
    if (alteracaoConcluida) {
      erro.value =
        'O status foi alterado, mas não foi possível atualizar ' +
        'a lista. Clique em Atualizar para consultar novamente.'
    } else {
      erro.value =
        e.message || 'Não foi possível alterar o status.'
    }

    confirmacao.value = null
  } finally {
    alterando.value = false
  }
}

// ======================================================
// EVENTOS DO COMPONENTE
// ======================================================

onMounted(() => {
  window.addEventListener(
    'cti-avatar-atualizado',
    aoAtualizarAvatar
  )

  document.addEventListener(
    'pointerdown',
    fecharDropdownFora
  )

  document.addEventListener(
    'keydown',
    fecharDropdownEscape
  )

  carregarUsuarios()
})

onUnmounted(() => {
  window.removeEventListener(
    'cti-avatar-atualizado',
    aoAtualizarAvatar
  )

  document.removeEventListener(
    'pointerdown',
    fecharDropdownFora
  )

  document.removeEventListener(
    'keydown',
    fecharDropdownEscape
  )

  opcoesRefs.clear()
})
</script>

<style scoped>
/* ======================================================
   CARDS ANIMADOS
   ====================================================== */

.card-indicador {
  animation: entrada-card 450ms ease-out both;

  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease;
}

.card-indicador:hover {
  transform: translateY(-5px);
  border-color: rgba(34, 211, 238, 0.35);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.icone-indicador {
  transition: transform 220ms ease;
}

.card-indicador:hover .icone-indicador {
  transform: scale(1.1);
}

@keyframes entrada-card {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ======================================================
   DROPDOWN PERSONALIZADO
   ====================================================== */

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-7px);
}

/* ======================================================
   ACESSIBILIDADE
   ====================================================== */

@media (prefers-reduced-motion: reduce) {
  .card-indicador {
    animation: none;
    transition: none;
  }

  .card-indicador:hover {
    transform: none;
  }

  .icone-indicador {
    transition: none;
  }

  .card-indicador:hover .icone-indicador {
    transform: none;
  }

  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: none;
  }
}
</style>