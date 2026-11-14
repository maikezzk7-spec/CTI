<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import LoginChart from '../components/LoginChart.vue'

const router = useRouter()

const nome = ref('')
const email = ref('')
const senha = ref('')
const confirmarSenha = ref('')

const mostrarSenha = ref(false)
const mostrarConfirmacao = ref(false)

const erro = ref('')
const sucesso = ref('')
const carregando = ref(false)

const senhasIguais = computed(
  () => senha.value === confirmarSenha.value
)

const recursos = [
  {
    titulo: 'Upload',
    descricao: 'Importação de planilhas',
    icone: 'fa-solid fa-cloud-arrow-up'
  },
  {
    titulo: 'Relatórios',
    descricao: 'Tratamento e validação',
    icone: 'fa-solid fa-file-lines'
  },
  {
    titulo: 'Gráficos',
    descricao: 'Visualização de indicadores',
    icone: 'fa-solid fa-chart-column'
  }
]

async function cadastrar() {
  if (carregando.value || sucesso.value) return

  erro.value = ''

  const nomeLimpo = nome.value.trim()
  const emailLimpo = email.value.trim().toLowerCase()

  if (nomeLimpo.length < 3) {
    erro.value =
      'Informe um nome com pelo menos 3 caracteres.'
    return
  }

  if (!emailLimpo) {
    erro.value = 'Informe um e-mail válido.'
    return
  }

  // A regra é a mesma do backend.
  // A recomendação de 8 a 16 caracteres é apenas visual.
  if (
    senha.value.length < 8 ||
    senha.value.length > 72 ||
    !/[A-Za-z]/.test(senha.value) ||
    !/[0-9]/.test(senha.value)
  ) {
    erro.value =
      'A senha deve ter de 8 a 72 caracteres, incluindo letras e números.'
    return
  }

  if (!senhasIguais.value) {
    erro.value =
      'As senhas informadas não coincidem.'
    return
  }

  carregando.value = true

  try {
    // Reutiliza a instância Axios já configurada.
    // O backend define o perfil USER e o status PENDENTE.
    await api.post('/auth/register', {
      nome: nomeLimpo,
      email: emailLimpo,
      senha: senha.value
    })

    sucesso.value =
      'Cadastro realizado com sucesso! Sua conta está aguardando aprovação do administrador.'

    senha.value = ''
    confirmarSenha.value = ''

    mostrarSenha.value = false
    mostrarConfirmacao.value = false
  } catch (e) {
    const dadosServidor = e.response?.data

    const mensagemServidor =
      dadosServidor?.message ||
      dadosServidor?.mensagem ||
      dadosServidor?.erro

    const erroSenha = dadosServidor?.campos?.senha

    if (
      typeof erroSenha === 'string' &&
      erroSenha.trim()
    ) {
      erro.value = erroSenha
    } else if (
      typeof mensagemServidor === 'string' &&
      mensagemServidor.trim() &&
      mensagemServidor !== 'Verifique os campos informados.'
    ) {
      erro.value = mensagemServidor
    } else if (e.response?.status === 409) {
      erro.value =
        'Já existe uma conta cadastrada com este e-mail.'
    } else if (e.response?.status === 400) {
      erro.value =
        'Confira os dados informados e tente novamente.'
    } else if (!e.response) {
      erro.value =
        'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
    } else {
      erro.value =
        'Não foi possível realizar o cadastro. Tente novamente.'
    }
  } finally {
    carregando.value = false
  }
}

function voltarLogin() {
  router.push('/login')
}
</script>

<template>
  <main
    class="relative flex min-h-screen min-h-dvh
           items-center justify-center overflow-clip
           bg-[#020617] px-3 py-3 text-white
           sm:px-6 sm:py-4 xl:px-8"
  >
    <!-- Iluminação decorativa -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -left-40 -top-40
             h-[400px] w-[400px] rounded-full
             bg-[#38BDF8]/10 blur-[100px]"
    ></div>

    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-32 right-0
             h-[350px] w-[350px] rounded-full
             bg-[#00C7A5]/10 blur-[100px]"
    ></div>

    <!-- Container principal -->
    <div
      class="relative z-10 grid w-full max-w-xl min-w-0
             overflow-hidden rounded-3xl border border-white/10
             bg-slate-900/40 shadow-2xl shadow-black/40
             backdrop-blur-xl
             min-[1200px]:max-w-6xl
             min-[1200px]:grid-cols-2"
    >
      <!-- Painel esquerdo -->
      <section
        class="relative hidden min-w-0 flex-col justify-between
               overflow-hidden border-r border-white/10
               bg-[#101D32]/80 p-6
               min-[1200px]:flex xl:p-8"
      >
        <!-- Grade decorativa -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 opacity-20"
          style="
            background-image:
              linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56,189,248,0.12) 1px, transparent 1px);
            background-size: 36px 36px;
          "
        ></div>

        <div
          aria-hidden="true"
          class="pointer-events-none absolute -right-24 top-32
                 h-72 w-72 rounded-full bg-[#38BDF8]/10 blur-3xl"
        ></div>

        <!-- Marca -->
        <div class="relative z-10 flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center
                   rounded-xl border border-[#38BDF8]/30
                   bg-[#38BDF8]/10"
          >
            <i
              class="fa-solid fa-cloud text-xl text-[#38BDF8]"
            ></i>
          </div>

          <h1 class="text-lg font-extrabold tracking-wider">
            CTI
            <span class="text-[#38BDF8]">
              INSIGHTS
            </span>
          </h1>
        </div>

        <!-- Apresentação -->
        <div class="relative z-10 my-4">
          <div
            class="mb-4 inline-flex items-center gap-2
                   rounded-full border border-[#38BDF8]/20
                   bg-[#38BDF8]/10 px-3 py-2
                   text-xs font-semibold text-[#7DD3FC]"
          >
            <i class="fa-solid fa-chart-line"></i>
            Plataforma de análise de dados
          </div>

          <h2
            class="max-w-md text-3xl font-extrabold
                   leading-tight tracking-tight
                   xl:text-4xl"
          >
            Seus dados,
            <span class="text-[#38BDF8]">
              novas possibilidades.
            </span>
          </h2>

          <p
            class="mt-3 max-w-md text-sm leading-6
                   text-slate-400 xl:text-base"
          >
            Comece a transformar informações em decisões
            inteligentes. Tudo em um ambiente moderno
            e organizado.
          </p>

          <!-- Gráfico existente -->
          <div class="mt-4">
            <LoginChart />
          </div>

          <!-- Recursos -->
          <div class="mt-4 space-y-2">
            <div
              v-for="recurso in recursos"
              :key="recurso.titulo"
              class="flex items-center gap-3 rounded-2xl
                     border border-white/10 bg-white/5 p-3
                     backdrop-blur-md transition duration-300
                     hover:-translate-y-0.5
                     hover:border-[#38BDF8]/30
                     hover:bg-white/10"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center
                       justify-center rounded-xl
                       border border-[#38BDF8]/20
                       bg-[#38BDF8]/10"
              >
                <i
                  :class="recurso.icone"
                  class="text-base text-[#38BDF8]"
                ></i>
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-bold text-white">
                  {{ recurso.titulo }}
                </h3>

                <p class="mt-0.5 text-xs text-slate-400">
                  {{ recurso.descricao }}
                </p>
              </div>

              <i
                class="fa-solid fa-arrow-trend-up ml-auto
                       text-xs text-[#38BDF8]/60"
              ></i>
            </div>
          </div>
        </div>

        <!-- Rodapé -->
        <div
          class="relative z-10 flex items-center gap-2
                 text-xs text-slate-500"
        >
          <i
            class="fa-solid fa-shield-halved text-[#00C7A5]"
          ></i>
          CTI Insights · Gestão inteligente de informações
        </div>
      </section>

      <!-- Painel direito -->
      <section
        class="flex min-w-0 items-center justify-center
               px-5 py-6 sm:px-10 sm:py-8
               min-[1200px]:px-10 xl:px-14"
      >
        <div class="w-full max-w-sm">
          <!-- Marca mobile -->
          <div
            class="mb-6 text-center min-[1200px]:hidden"
          >
            <div
              class="mx-auto mb-3 flex h-14 w-14
                     items-center justify-center rounded-2xl
                     border border-[#38BDF8]/30
                     bg-[#38BDF8]/10"
            >
              <i
                class="fa-solid fa-cloud
                       text-2xl text-[#38BDF8]"
              ></i>
            </div>

            <h1
              class="text-2xl font-extrabold tracking-wider"
            >
              CTI
              <span class="text-[#38BDF8]">
                INSIGHTS
              </span>
            </h1>

            <p class="mt-2 text-sm text-slate-400">
              Inteligência e gestão de dados
            </p>
          </div>

          <!-- Cabeçalho -->
          <div class="mb-6 text-center">
            <h2
              class="text-2xl font-extrabold
                     text-white sm:text-3xl"
            >
              Criar conta
            </h2>

            <p
              class="mt-3 text-sm leading-relaxed
                     text-slate-400"
            >
              Preencha seus dados para solicitar acesso.
            </p>
          </div>

          <!-- Formulário -->
          <form
            class="space-y-4"
            @submit.prevent="cadastrar"
          >
            <!-- Nome completo -->
            <div>
              <label
                for="nome"
                class="mb-2 block text-sm
                       font-semibold text-slate-300"
              >
                Nome completo
              </label>

              <div class="relative">
                <i
                  class="fa-solid fa-user
                         pointer-events-none absolute
                         left-4 top-1/2 -translate-y-1/2
                         text-slate-500"
                ></i>

                <input
                  id="nome"
                  v-model.trim="nome"
                  type="text"
                  autocomplete="name"
                  minlength="3"
                  maxlength="150"
                  required
                  :disabled="carregando || !!sucesso"
                  placeholder="Digite seu nome completo"
                  class="cti-auth-input w-full min-w-0
                         rounded-xl border border-slate-700
                         bg-slate-950/80 py-3.5 pl-11 pr-4
                         text-sm text-white outline-none
                         transition duration-300
                         placeholder:text-slate-500
                         focus:border-[#38BDF8]
                         focus:ring-2 focus:ring-[#38BDF8]/20
                         disabled:opacity-60"
                />
              </div>
            </div>

            <!-- E-mail -->
            <div>
              <label
                for="emailCadastro"
                class="mb-2 block text-sm
                       font-semibold text-slate-300"
              >
                E-mail
              </label>

              <div class="relative">
                <i
                  class="fa-regular fa-envelope
                         pointer-events-none absolute
                         left-4 top-1/2 -translate-y-1/2
                         text-slate-500"
                ></i>

                <input
                  id="emailCadastro"
                  v-model.trim="email"
                  type="email"
                  autocomplete="email"
                  maxlength="254"
                  required
                  :disabled="carregando || !!sucesso"
                  placeholder="seuemail@exemplo.com"
                  class="cti-auth-input w-full min-w-0
                         rounded-xl border border-slate-700
                         bg-slate-950/80 py-3.5 pl-11 pr-4
                         text-sm text-white outline-none
                         transition duration-300
                         placeholder:text-slate-500
                         focus:border-[#38BDF8]
                         focus:ring-2 focus:ring-[#38BDF8]/20
                         disabled:opacity-60"
                />
              </div>
            </div>

            <!-- Senha -->
            <div>
              <label
                for="senhaCadastro"
                class="mb-2 block text-sm
                       font-semibold text-slate-300"
              >
                Senha
              </label>

              <div class="relative">
                <i
                  class="fa-solid fa-lock
                         pointer-events-none absolute
                         left-4 top-1/2 -translate-y-1/2
                         text-slate-500"
                ></i>

                <input
                  id="senhaCadastro"
                  v-model="senha"
                  :type="mostrarSenha ? 'text' : 'password'"
                  autocomplete="new-password"
                  minlength="8"
                  maxlength="72"
                  required
                  :disabled="carregando || !!sucesso"
                  placeholder="Crie sua senha"
                  class="cti-auth-input w-full min-w-0
                         rounded-xl border border-slate-700
                         bg-slate-950/80 py-3.5 pl-11 pr-12
                         text-sm text-white outline-none
                         transition duration-300
                         placeholder:text-slate-500
                         focus:border-[#38BDF8]
                         focus:ring-2 focus:ring-[#38BDF8]/20
                         disabled:opacity-60"
                />

                <!-- Único botão de mostrar senha -->
                <button
                  type="button"
                  :disabled="carregando || !!sucesso"
                  :aria-label="
                    mostrarSenha
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  "
                  :aria-pressed="mostrarSenha"
                  class="absolute right-4 top-1/2
                         -translate-y-1/2
                         text-[#38BDF8]
                         transition hover:text-sky-300
                         disabled:cursor-not-allowed
                         disabled:opacity-60"
                  @click="mostrarSenha = !mostrarSenha"
                >
                  <i
                    :class="
                      mostrarSenha
                        ? 'fa-regular fa-eye-slash'
                        : 'fa-regular fa-eye'
                    "
                  ></i>
                </button>
              </div>

              <p class="mt-2 text-xs text-slate-400">
                Recomendamos de 8 a 16 caracteres.
              </p>
            </div>

            <!-- Confirmar senha -->
            <div>
              <label
                for="confirmarSenha"
                class="mb-2 block text-sm
                       font-semibold text-slate-300"
              >
                Confirmar senha
              </label>

              <div class="relative">
                <i
                  class="fa-solid fa-lock
                         pointer-events-none absolute
                         left-4 top-1/2 -translate-y-1/2
                         text-slate-500"
                ></i>

                <input
                  id="confirmarSenha"
                  v-model="confirmarSenha"
                  :type="
                    mostrarConfirmacao
                      ? 'text'
                      : 'password'
                  "
                  autocomplete="new-password"
                  minlength="8"
                  maxlength="72"
                  required
                  :disabled="carregando || !!sucesso"
                  placeholder="Digite a senha novamente"
                  class="cti-auth-input w-full min-w-0
                         rounded-xl border border-slate-700
                         bg-slate-950/80 py-3.5 pl-11 pr-12
                         text-sm text-white outline-none
                         transition duration-300
                         placeholder:text-slate-500
                         focus:border-[#38BDF8]
                         focus:ring-2 focus:ring-[#38BDF8]/20
                         disabled:opacity-60"
                />

                <!-- Único botão de mostrar confirmação -->
                <button
                  type="button"
                  :disabled="carregando || !!sucesso"
                  :aria-label="
                    mostrarConfirmacao
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  "
                  :aria-pressed="mostrarConfirmacao"
                  class="absolute right-4 top-1/2
                         -translate-y-1/2
                         text-[#38BDF8]
                         transition hover:text-sky-300
                         disabled:cursor-not-allowed
                         disabled:opacity-60"
                  @click="
                    mostrarConfirmacao = !mostrarConfirmacao
                  "
                >
                  <i
                    :class="
                      mostrarConfirmacao
                        ? 'fa-regular fa-eye-slash'
                        : 'fa-regular fa-eye'
                    "
                  ></i>
                </button>
              </div>
            </div>

            <!-- Mensagem de erro -->
            <div
              v-if="erro"
              role="alert"
              class="flex items-start gap-2 rounded-xl
                     border border-red-500/30
                     bg-red-500/10 p-3
                     text-sm text-red-300"
            >
              <i
                class="fa-solid fa-circle-exclamation mt-0.5"
              ></i>
              <span>{{ erro }}</span>
            </div>

            <!-- Mensagem de sucesso -->
            <div
              v-if="sucesso"
              role="status"
              class="flex items-start gap-2 rounded-xl
                     border border-emerald-500/30
                     bg-emerald-500/10 p-4
                     text-sm text-emerald-300"
            >
              <i
                class="fa-solid fa-circle-check mt-0.5"
              ></i>
              <span>{{ sucesso }}</span>
            </div>

            <!-- Botão de cadastro -->
            <button
              type="submit"
              :disabled="carregando || !!sucesso"
              class="flex w-full cursor-pointer items-center
                     justify-center gap-2 rounded-xl
                     bg-[#38BDF8] px-4 py-3.5
                     font-extrabold text-slate-950
                     shadow-lg shadow-sky-500/20
                     transition duration-300
                     hover:-translate-y-0.5
                     hover:bg-sky-300
                     disabled:cursor-not-allowed
                     disabled:opacity-60"
            >
              <i
                :class="
                  carregando
                    ? 'fa-solid fa-spinner fa-spin'
                    : sucesso
                      ? 'fa-solid fa-check'
                      : 'fa-solid fa-user-plus'
                "
              ></i>

              {{
                carregando
                  ? 'Cadastrando...'
                  : sucesso
                    ? 'Solicitação enviada'
                    : 'Criar conta'
              }}
            </button>
          </form>

          <!-- Voltar ao Login -->
          <div
            class="mt-6 border-t border-white/10
                   pt-5 text-center"
          >
            <p class="text-sm text-slate-400">
              {{
                sucesso
                  ? 'Sua solicitação foi enviada.'
                  : 'Já possui uma conta?'
              }}
            </p>

            <button
              type="button"
              class="mt-2 cursor-pointer text-sm
                     font-semibold text-[#38BDF8]
                     transition hover:text-sky-300
                     hover:underline"
              @click="voltarLogin"
            >
              {{
                sucesso
                  ? 'Voltar ao login'
                  : 'Entrar no sistema'
              }}
            </button>
          </div>

          <!-- Página inicial -->
          <div class="mt-6 text-center">
            <RouterLink
              to="/"
              class="inline-flex items-center gap-2
                     text-sm font-medium text-slate-400
                     transition hover:text-[#38BDF8]"
            >
              <i class="fa-solid fa-arrow-left"></i>
              Voltar à página inicial
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
/*
  Mantém os campos escuros durante o
  preenchimento automático do Edge/Chrome.
*/
.cti-auth-input {
  color-scheme: dark;
  caret-color: #38bdf8;
}

.cti-auth-input:-webkit-autofill,
.cti-auth-input:-webkit-autofill:hover,
.cti-auth-input:-webkit-autofill:focus,
.cti-auth-input:-webkit-autofill:active {
  -webkit-text-fill-color: #ffffff !important;
  -webkit-box-shadow:
    0 0 0 1000px #020617 inset !important;
  box-shadow:
    0 0 0 1000px #020617 inset !important;
  caret-color: #38bdf8;
  transition: background-color 9999s ease-out 0s;
}

/*
  Remove o botão nativo do Edge,
  mantendo somente o botão ciano.
*/
.cti-auth-input::-ms-reveal,
.cti-auth-input::-ms-clear {
  display: none !important;
}
</style>