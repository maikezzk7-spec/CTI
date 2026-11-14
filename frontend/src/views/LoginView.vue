<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginChart from '../components/LoginChart.vue'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)
const mostrarSenha = ref(false)

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

async function entrar() {
  if (carregando.value) return

  erro.value = ''
  carregando.value = true

  try {
    await auth.login(
      email.value.trim(),
      senha.value
    )

    await router.push('/app/upload')
  } catch (e) {
    erro.value =
      e.response?.data?.message ||
      e.response?.data?.mensagem ||
      'Não foi possível entrar. Verifique suas credenciais ou a conexão com o servidor.'
  } finally {
    carregando.value = false
  }
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
            Transforme
            <span class="text-[#38BDF8]">
              dados
            </span>
            em decisões.
          </h2>

          <p
            class="mt-3 max-w-md text-sm leading-6
                   text-slate-400 xl:text-base"
          >
            Importe, valide e visualize informações em um só lugar.
            Mais organização, clareza e inteligência para seus dados.
          </p>

          <!-- Gráfico -->
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
               px-5 py-8 sm:px-10 sm:py-10
               min-[1200px]:px-10 xl:px-14"
      >
        <div class="w-full max-w-sm">
          <!-- Marca mobile -->
          <div
            class="mb-7 text-center min-[1200px]:hidden"
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
          <div class="mb-7 text-center">
            <h2
              class="text-2xl font-extrabold text-white
                     sm:text-3xl"
            >
              Bem-vindo de volta!
            </h2>

            <p
              class="mt-3 text-sm leading-relaxed
                     text-slate-400"
            >
              Entre com suas credenciais para acessar o sistema.
            </p>
          </div>

          <!-- Formulário -->
          <form
            class="space-y-5"
            @submit.prevent="entrar"
          >
            <!-- E-mail -->
            <div>
              <label
                for="email"
                class="mb-2 block text-sm
                       font-semibold text-slate-300"
              >
                E-mail corporativo
              </label>

              <div class="relative">
                <i
                  class="fa-regular fa-envelope
                         pointer-events-none absolute
                         left-4 top-1/2 -translate-y-1/2
                         text-slate-500"
                ></i>

                <input
                  id="email"
                  v-model.trim="email"
                  type="email"
                  autocomplete="username"
                  placeholder="seuemail@exemplo.com"
                  required
                  class="cti-auth-input w-full min-w-0
                         rounded-xl border border-slate-700
                         bg-slate-950/80 py-3.5 pl-11 pr-4
                         text-sm text-white outline-none
                         transition duration-300
                         placeholder:text-slate-500
                         focus:border-[#38BDF8]
                         focus:ring-2 focus:ring-[#38BDF8]/20"
                />
              </div>
            </div>

            <!-- Senha -->
            <div>
              <label
                for="senha"
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
                  id="senha"
                  v-model="senha"
                  :type="mostrarSenha ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Digite sua senha"
                  minlength="8"
                  maxlength="72"
                  required
                  class="cti-auth-input w-full min-w-0
                         rounded-xl border border-slate-700
                         bg-slate-950/80 py-3.5 pl-11 pr-12
                         text-sm text-white outline-none
                         transition duration-300
                         placeholder:text-slate-500
                         focus:border-[#38BDF8]
                         focus:ring-2 focus:ring-[#38BDF8]/20"
                />

                <!-- Nosso único botão de exibição -->
                <button
                  type="button"
                  :aria-label="
                    mostrarSenha
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  "
                  :aria-pressed="mostrarSenha"
                  class="absolute right-4 top-1/2
                         -translate-y-1/2 cursor-pointer
                         text-[#38BDF8]
                         transition hover:text-sky-300"
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
                Informe sua senha de acesso
              </p>
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

            <!-- Entrar -->
            <button
              type="submit"
              :disabled="carregando"
              class="flex w-full cursor-pointer items-center
                     justify-center gap-3 rounded-xl
                     bg-[#38BDF8] px-4 py-3.5
                     font-extrabold text-slate-950
                     shadow-lg shadow-sky-500/20
                     transition duration-300
                     hover:-translate-y-0.5
                     hover:bg-sky-300
                     hover:shadow-sky-500/30
                     disabled:cursor-not-allowed
                     disabled:opacity-60"
            >
              <i
                :class="
                  carregando
                    ? 'fa-solid fa-spinner fa-spin'
                    : 'fa-solid fa-right-to-bracket'
                "
              ></i>

              {{
                carregando
                  ? 'Entrando...'
                  : 'Entrar no sistema'
              }}
            </button>
          </form>

          <!-- Cadastro -->
          <div
            class="mt-6 border-t border-white/10
                   pt-5 text-center"
          >
            <p class="text-sm text-slate-400">
              Ainda não possui uma conta?
            </p>

            <RouterLink
              to="/cadastro"
              class="mt-2 inline-block text-sm
                     font-semibold text-[#38BDF8]
                     transition hover:text-sky-300
                     hover:underline"
            >
              <i class="fa-solid fa-user-plus mr-1"></i>
              Crie uma conta
            </RouterLink>
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
  Mantém os campos escuros quando o Edge ou
  Chrome preenche automaticamente o e-mail.
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
  Oculta o botão nativo de exibição de senha
  do Edge, preservando o botão ciano.
*/
.cti-auth-input::-ms-reveal,
.cti-auth-input::-ms-clear {
  display: none !important;
}
</style>