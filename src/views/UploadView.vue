
<template>
  <div class="space-y-6 text-cti-text">
    <!-- Cabeçalho -->
    <header class="mb-6">
      <div class="mb-2 flex items-center gap-2 text-sm text-cti-cyan">
        <i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
        <span>Importação de dados</span>
      </div>

      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
        Upload de Planilha
      </h1>

      <p class="mt-2 text-sm leading-6 text-cti-muted sm:text-base">
        Importe sua planilha, valide os dados e identifique inconsistências.
      </p>
    </header>

    <!-- Área de upload -->
    <section
      class="rounded-2xl border border-cti-border bg-cti-card p-5 shadow-lg shadow-black/10 sm:p-7"
    >
      <div class="mb-5 flex items-center gap-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-cti-cyan/10 text-cti-cyan"
        >
          <i class="fa-solid fa-file-excel text-xl" aria-hidden="true"></i>
        </div>

        <div>
          <h2 class="font-semibold">Selecionar arquivo</h2>
          <p class="mt-1 text-sm text-cti-muted">
            Formatos aceitos: XLSX, XLS e CSV
          </p>
        </div>
      </div>

      <!-- Seleção por clique ou arrastar e soltar -->
      <label
        @dragenter.prevent="aoArrastarSobre"
        @dragover.prevent="aoArrastarSobre"
        @dragleave.prevent="aoSairDaArea"
        @drop.prevent="aoSoltarArquivo"
        :class="[
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition duration-200',
          arrastando
            ? 'border-cti-cyan bg-cti-cyan/10'
            : 'border-cti-border bg-cti-panel/60 hover:border-cti-cyan hover:bg-cti-cyan/5',
        ]"
      >
        <i
          class="fa-solid fa-cloud-arrow-up mb-3 text-3xl text-cti-cyan"
          aria-hidden="true"
        ></i>

        <span class="font-medium">
          {{
            arrastando
              ? "Solte a planilha aqui"
              : "Clique ou arraste sua planilha"
          }}
        </span>

        <span class="mt-2 text-sm text-cti-muted">
          Escolha um arquivo salvo no seu computador
        </span>

        <!-- Nome do arquivo selecionado -->
        <span
          v-if="nomeArquivo"
          class="mt-3 max-w-full break-all rounded-lg bg-cti-cyan/10 px-3 py-2 text-sm text-cti-cyan"
        >
          <i class="fa-solid fa-file-lines mr-2" aria-hidden="true"></i>
          {{ nomeArquivo }}
        </span>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          class="sr-only"
          @change="selecionarArquivo"
        />
      </label>

      <!-- Botão de processamento -->
      <div class="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-cti-muted">
          <i
            class="fa-solid fa-shield-halved mr-2 text-cti-cyan"
            aria-hidden="true"
          ></i>
          Os dados serão analisados pela validação do sistema.
        </p>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-cti-cyan px-5 py-3 font-semibold text-slate-950 transition duration-200 hover:bg-cti-turquoise hover:shadow-lg hover:shadow-cti-cyan/10 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="uploadStore.carregando"
          @click="processarPlanilha"
        >
          <i
            :class="
              uploadStore.carregando
                ? 'fa-solid fa-spinner animate-spin'
                : 'fa-solid fa-play'
            "
            aria-hidden="true"
          ></i>

          {{
            uploadStore.carregando
              ? "Processando..."
              : "Processar planilha"
          }}
        </button>
      </div>
    </section>

    <!-- Erros de validação -->
    <section
      v-if="uploadStore.totalErros"
      class="rounded-2xl border border-red-400/20 bg-red-500/5 p-5 sm:p-6"
    >
      <div class="mb-4 flex items-center gap-3">
        <i
          class="fa-solid fa-triangle-exclamation text-xl text-red-400"
          aria-hidden="true"
        ></i>

        <h2 class="text-lg font-semibold text-red-300">
          Problemas encontrados
        </h2>
      </div>

      <ul class="space-y-2">
        <li
          v-for="(erro, index) in uploadStore.erros"
          :key="index"
          class="rounded-lg border border-red-400/10 bg-red-500/5 px-4 py-3 text-sm text-cti-text"
        >
          {{ erro }}
        </li>
      </ul>
    </section>

    <!-- Resumo da validação -->
    <section v-if="uploadStore.temDados" class="space-y-4">
      <div>
        <h2 class="text-xl font-bold">Resumo da validação</h2>
        <p class="mt-1 text-sm text-cti-muted">
          Confira os principais resultados da análise.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <!-- Total de clientes -->
        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition hover:border-cti-cyan/40"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Total de clientes</p>
              <strong class="mt-3 block text-3xl font-bold">
                {{ uploadStore.totalClientes }}
              </strong>
            </div>

            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-cti-cyan/10 text-cti-cyan"
            >
              <i class="fa-solid fa-users" aria-hidden="true"></i>
            </span>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Registros identificados na planilha
          </p>
        </article>

        <!-- Clientes nível A -->
        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition hover:border-cti-cyan/40"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Clientes nível A</p>
              <strong class="mt-3 block text-3xl font-bold text-cti-cyan">
                {{ uploadStore.clientesNivelA }}
              </strong>
            </div>

            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-cti-cyan/10 text-cti-cyan"
            >
              <i class="fa-solid fa-star" aria-hidden="true"></i>
            </span>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Clientes classificados no nível A
          </p>
        </article>

        <!-- Clientes validados -->
        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition hover:border-green-400/40"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Clientes validados</p>
              <strong class="mt-3 block text-3xl font-bold text-green-400">
                {{ uploadStore.totalValidados }}
              </strong>
            </div>

            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-400/10 text-green-400"
            >
              <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
            </span>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Registros sem inconsistências
          </p>
        </article>

        <!-- Clientes invalidados -->
        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition hover:border-red-400/40"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Clientes invalidados</p>
              <strong class="mt-3 block text-3xl font-bold text-red-400">
                {{ uploadStore.totalInvalidados }}
              </strong>
            </div>

            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-red-400"
            >
              <i
                class="fa-solid fa-triangle-exclamation"
                aria-hidden="true"
              ></i>
            </span>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Registros que precisam de correção
          </p>
        </article>

        <!-- Percentual válido -->
        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition hover:border-cti-cyan/40"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Percentual válido</p>
              <strong class="mt-3 block text-3xl font-bold text-cti-cyan">
                {{ uploadStore.percentualValido }}%
              </strong>
            </div>

            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-cti-cyan/10 text-cti-cyan"
            >
              <i class="fa-solid fa-chart-pie" aria-hidden="true"></i>
            </span>
          </div>

          <div class="mt-4 h-2 overflow-hidden rounded-full bg-cti-border">
            <div
              class="h-full rounded-full bg-gradient-to-r from-cti-cyan to-cti-turquoise transition-all duration-500"
              :style="{ width: `${uploadStore.percentualValido}%` }"
            ></div>
          </div>
        </article>

        <!-- Total de erros -->
        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition hover:border-amber-400/40"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Total de erros</p>
              <strong class="mt-3 block text-3xl font-bold text-amber-400">
                {{ uploadStore.totalErros }}
              </strong>
            </div>

            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400"
            >
              <i class="fa-solid fa-bug" aria-hidden="true"></i>
            </span>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Inconsistências identificadas
          </p>
        </article>
      </div>
    </section>

    <!-- Clientes invalidados -->
    <section
      v-if="uploadStore.dadosInvalidados.length"
      class="rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6"
    >
      <div class="mb-5">
        <h2 class="text-xl font-bold">Clientes invalidados</h2>
        <p class="mt-1 text-sm text-cti-muted">
          Consulte os registros que precisam de correção.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article
          v-for="(cliente, index) in uploadStore.dadosInvalidados"
          :key="index"
          class="rounded-xl border border-cti-border bg-cti-panel p-4"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <p class="text-xs text-cti-muted">Código do cliente</p>
              <h3 class="mt-1 font-semibold">
                {{ cliente.codigo_cliente || "Não informado" }}
              </h3>
            </div>

            <span
              class="rounded-full bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-300"
            >
              Inválido
            </span>
          </div>

          <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-cti-muted">Nome</dt>
              <dd class="mt-1 break-words">
                {{ cliente.nome_cliente || "Não informado" }}
              </dd>
            </div>

            <div>
              <dt class="text-cti-muted">Consultor</dt>
              <dd class="mt-1 break-words">
                {{ cliente.consultor || "Não informado" }}
              </dd>
            </div>

            <div>
              <dt class="text-cti-muted">Segmento</dt>
              <dd class="mt-1 break-words">
                {{ cliente.segmento || "Não informado" }}
              </dd>
            </div>

            <div>
              <dt class="text-cti-muted">Nível</dt>
              <dd class="mt-1">
                {{ cliente.nivel_cliente || "Não informado" }}
              </dd>
            </div>
          </dl>

          <div class="mt-4 border-t border-cti-border pt-4">
            <p class="mb-2 text-sm font-semibold text-red-300">
              <i
                class="fa-solid fa-circle-exclamation mr-2"
                aria-hidden="true"
              ></i>
              Erros encontrados
            </p>

            <ul class="list-inside list-disc space-y-1 text-sm text-cti-muted">
              <li v-for="(erro, erroIndex) in cliente.erros" :key="erroIndex">
                {{ erro }}
              </li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <!-- Prévia dos dados -->
    <section
      v-if="uploadStore.temDados"
      class="rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6"
    >
      <div class="mb-5">
        <h2 class="text-xl font-bold">Prévia dos dados</h2>
        <p class="mt-1 text-sm text-cti-muted">
          Confira os registros importados da planilha.
        </p>
      </div>

      <div class="overflow-x-auto rounded-xl border border-cti-border">
        <table class="w-full min-w-max border-collapse text-left text-sm">
          <thead class="bg-cti-panel text-cti-muted">
            <tr>
              <th
                v-for="coluna in colunas"
                :key="coluna"
                class="whitespace-nowrap border-b border-cti-border px-4 py-3 font-semibold"
              >
                {{ coluna }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(linha, index) in uploadStore.dadosTratados"
              :key="index"
              class="border-b border-cti-border/70 transition hover:bg-cti-cyan/5"
            >
              <td
                v-for="coluna in colunas"
                :key="coluna"
                class="whitespace-nowrap px-4 py-3 text-cti-text"
              >
                {{ linha[coluna] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useUploadStore } from "../stores/uploadStore";

const uploadStore = useUploadStore();

const arrastando = ref(false);
const nomeArquivo = ref("");

function selecionarArquivo(event) {
  const arquivo = event.target.files[0];

  if (arquivo) {
    nomeArquivo.value = arquivo.name;
    uploadStore.selecionarArquivo(arquivo);
  }

  // Permite selecionar novamente o mesmo arquivo.
  event.target.value = "";
}

function aoArrastarSobre(event) {
  event.preventDefault();
  arrastando.value = true;
}

function aoSairDaArea(event) {
  event.preventDefault();
  arrastando.value = false;
}

function aoSoltarArquivo(event) {
  arrastando.value = false;

  const arquivo = event.dataTransfer.files[0];

  if (arquivo) {
    nomeArquivo.value = arquivo.name;
    uploadStore.selecionarArquivo(arquivo);
  }
}

async function processarPlanilha() {
  await uploadStore.processarPlanilha();
}

const colunas = computed(() => {
  if (!uploadStore.dadosTratados.length) {
    return [];
  }

  return Object.keys(uploadStore.dadosTratados[0]);
});
</script>