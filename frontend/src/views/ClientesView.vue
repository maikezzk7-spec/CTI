<template>
  <section class="w-full min-w-0 space-y-6">
    <!-- Cabeçalho -->
    <div>
      <p class="text-sm font-medium text-cti-cyan">
        <i class="fa-solid fa-users mr-2" aria-hidden="true"></i>
        CTI Insights / Clientes
      </p>

      <h1 class="mt-2 text-3xl font-bold text-cti-text">
        Clientes
      </h1>

      <p class="mt-2 text-cti-muted">
        Consulte, pesquise e filtre os registros da planilha processada.
      </p>
    </div>

    <!-- Estado vazio -->
    <div
      v-if="!store.temDados"
      class="rounded-2xl border border-dashed border-cti-border bg-cti-sidebar px-6 py-14 text-center"
    >
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cti-cyan/10 text-cti-cyan"
      >
        <i class="fa-solid fa-users text-3xl" aria-hidden="true"></i>
      </div>

      <h2 class="mt-5 text-xl font-semibold text-cti-text">
        Nenhum cliente disponível
      </h2>

      <p class="mx-auto mt-3 max-w-xl text-cti-muted">
        Acesse Upload, selecione uma planilha e processe os dados
        para visualizar os clientes nesta tela.
      </p>

      <RouterLink
        to="/app/upload"
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-cti-cyan px-5 py-3 font-semibold text-slate-950 transition hover:opacity-90"
      >
        <i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
        Ir para Upload
      </RouterLink>
    </div>

    <template v-else>
      <!-- Indicadores: padrão visual da tela Gráficos -->
      <section
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Resumo dos clientes"
      >
        <article
          v-for="indicador in indicadores"
          :key="indicador.chave"
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors duration-200"
          :class="indicador.bordaHover"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm text-cti-muted">
                {{ indicador.titulo }}
              </p>

              <p
                class="mt-3 text-3xl font-bold"
                :class="indicador.corValor"
              >
                {{ indicador.valor }}
              </p>
            </div>

            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              :class="indicador.corIcone"
            >
              <i
                :class="indicador.icone"
                class="text-lg"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            {{ indicador.descricao }}
          </p>
        </article>
      </section>

      <!-- Filtros -->
      <div class="rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="flex items-center gap-2 text-lg font-semibold text-cti-text">
              <i
                class="fa-solid fa-sliders text-cti-cyan"
                aria-hidden="true"
              ></i>
              Pesquisar clientes
            </h2>

            <p class="mt-1 text-sm text-cti-muted">
              Combine os filtros para localizar registros.
            </p>
          </div>

          <button
            type="button"
            class="rounded-xl border border-cti-border px-4 py-2 text-sm text-cti-text transition hover:border-cti-cyan hover:text-cti-cyan"
            @click="limparFiltros"
          >
            <i
              class="fa-solid fa-filter-circle-xmark mr-2"
              aria-hidden="true"
            ></i>
            Limpar filtros
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <!-- Busca -->
          <div class="min-w-0">
            <label
              for="busca-cliente"
              class="mb-2 block text-sm font-medium text-cti-muted"
            >
              Nome ou código
            </label>

            <div class="relative">
              <i
                class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-cti-cyan"
                aria-hidden="true"
              ></i>

              <input
                id="busca-cliente"
                v-model="busca"
                type="search"
                placeholder="Pesquisar cliente..."
                class="min-h-11 w-full rounded-xl border border-cti-border bg-cti-bg py-2.5 pl-11 pr-4 text-sm text-cti-text outline-none transition hover:border-cti-cyan/50 focus:border-cti-cyan"
              />
            </div>
          </div>

          <!-- Segmento -->
          <FiltroSelect
            id="filtro-segmento"
            v-model="segmentoSelecionado"
            label="Segmento"
            placeholder="Todos os segmentos"
            icone="fa-solid fa-building"
            :opcoes="segmentos"
            :incluir-todos="true"
            direcao="baixo"
          />

          <!-- Nível -->
          <FiltroSelect
            id="filtro-nivel"
            v-model="nivelSelecionado"
            label="Nível do cliente"
            placeholder="Todos os níveis"
            icone="fa-solid fa-ranking-star"
            :opcoes="niveis"
            :incluir-todos="true"
            direcao="baixo"
          />

          <!-- UF -->
          <FiltroSelect
            id="filtro-uf"
            v-model="ufSelecionada"
            label="Estado (UF)"
            placeholder="Todas as UFs"
            icone="fa-solid fa-map-location-dot"
            :opcoes="opcoesUF"
            :incluir-todos="true"
            direcao="baixo"
          />
        </div>

        <!-- Filtros ativos -->
        <div
          v-if="quantidadeFiltros > 0"
          class="mt-5 flex flex-wrap items-center gap-2 border-t border-cti-border pt-4"
        >
          <span class="text-sm text-cti-muted">
            Filtros ativos:
          </span>

          <span
            v-if="busca.trim()"
            class="rounded-lg bg-cti-cyan/10 px-3 py-1.5 text-xs font-medium text-cti-cyan"
          >
            Busca: {{ busca }}
          </span>

          <span
            v-if="segmentoSelecionado"
            class="rounded-lg bg-cti-cyan/10 px-3 py-1.5 text-xs font-medium text-cti-cyan"
          >
            {{ segmentoSelecionado }}
          </span>

          <span
            v-if="nivelSelecionado"
            class="rounded-lg bg-cti-cyan/10 px-3 py-1.5 text-xs font-medium text-cti-cyan"
          >
            Nível {{ nivelSelecionado }}
          </span>

          <span
            v-if="ufSelecionada"
            class="rounded-lg bg-cti-cyan/10 px-3 py-1.5 text-xs font-medium text-cti-cyan"
          >
            {{ nomeUF(ufSelecionada) }}
          </span>
        </div>
      </div>

      <!-- Tabela -->
      <div class="min-w-0 rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold text-cti-text">
              Listagem de clientes
            </h2>

            <p class="mt-1 text-sm text-cti-muted">
              {{ clientesFiltrados.length }} registro(s) encontrado(s).
            </p>
          </div>

          <button
            type="button"
            :disabled="clientesFiltrados.length === 0"
            class="rounded-xl bg-cti-cyan px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            @click="exportarCSV"
          >
            <i class="fa-solid fa-file-csv mr-2" aria-hidden="true"></i>
            Exportar CSV
          </button>
        </div>

        <div class="w-full overflow-x-auto rounded-xl border border-cti-border">
          <table class="w-full min-w-[1120px] text-sm">
            <thead class="bg-cti-panel text-cti-muted">
              <tr>
                <th class="px-4 py-4 text-left font-semibold">
                  Código
                </th>

                <th class="px-4 py-4 text-left font-semibold">
                  Nome Cliente
                </th>

                <th class="px-4 py-4 text-left font-semibold">
                  Segmento
                </th>

                <th class="px-4 py-4 text-center font-semibold">
                  Nível Cliente
                </th>

                <th class="px-4 py-4 text-center font-semibold">
                  Faturamento Anual
                </th>

                <th class="px-4 py-4 text-center font-semibold">
                  Data Contratação
                </th>

                <th class="px-4 py-4 text-left font-semibold">
                  Cidade
                </th>

                <th class="px-4 py-4 text-center font-semibold">
                  UF
                </th>

                <th class="px-4 py-4 text-center font-semibold">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(cliente, indice) in clientesPaginados"
                :key="`${paginaAtual}-${indice}`"
                class="border-b border-cti-border/70 transition hover:bg-cti-cyan/5"
              >
                <td class="whitespace-nowrap px-4 py-4 text-cti-text">
                  {{ exibir(cliente.codigo_cliente) }}
                </td>

                <td class="px-4 py-4 font-medium text-cti-text">
                  {{ exibir(cliente.nome_cliente) }}
                </td>

                <td class="px-4 py-4 text-cti-text">
                  {{ exibir(cliente.segmento) }}
                </td>

                <td class="px-4 py-4 text-center text-cti-text">
                  {{ exibir(cliente.nivel_cliente) }}
                </td>

                <td class="whitespace-nowrap px-4 py-4 text-center text-cti-text">
                  {{ formatarMoeda(cliente.faturamento_anual) }}
                </td>

                <td class="whitespace-nowrap px-4 py-4 text-center text-cti-text">
                  {{ exibir(cliente.data_contratacao) }}
                </td>

                <td class="px-4 py-4 text-cti-text">
                  {{ exibir(cliente.cidade) }}
                </td>

                <td class="px-4 py-4 text-center text-cti-text">
                  {{ exibir(cliente.uf) }}
                </td>

                <!-- Ícone de olho -->
                <td class="px-4 py-4 text-center">
                  <button
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cti-border text-cti-cyan transition-all duration-200 hover:border-cti-cyan/50 hover:bg-cti-cyan/10 focus:outline-none focus:ring-2 focus:ring-cti-cyan/30"
                    :aria-label="`Ver detalhes de ${exibir(cliente.nome_cliente)}`"
                    title="Visualizar detalhes"
                    @click="abrirDetalhes(cliente)"
                  >
                    <i
                      class="fa-solid fa-eye"
                      aria-hidden="true"
                    ></i>
                  </button>
                </td>
              </tr>

              <tr v-if="clientesFiltrados.length === 0">
                <td
                  colspan="9"
                  class="px-4 py-12 text-center text-cti-muted"
                >
                  <i
                    class="fa-solid fa-magnifying-glass mb-3 block text-2xl text-cti-cyan"
                    aria-hidden="true"
                  ></i>

                  Nenhum cliente corresponde aos filtros.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <PaginacaoTabela
          v-if="clientesFiltrados.length > 0"
          v-model:paginaAtual="paginaAtual"
          v-model:tamanhoPagina="tamanhoPagina"
          :total-itens="clientesFiltrados.length"
          class="mt-5"
        />
      </div>

      <p class="text-sm text-cti-muted">
        <i
          class="fa-solid fa-circle-info mr-2"
          aria-hidden="true"
        ></i>

        Os registros exibidos pertencem à última planilha
        processada nesta sessão. O salvamento permanente
        será implementado com PostgreSQL.
      </p>
    </template>

    <!-- Modal de detalhes -->
    <Teleport to="body">
      <div
        v-if="clienteSelecionado"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
        @click.self="fecharDetalhes"
      >
        <div
          ref="modalDetalhes"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-detalhes-cliente"
          tabindex="-1"
          class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-cti-border bg-[#101D32] text-cti-text shadow-2xl"
          @keydown.esc.stop.prevent="fecharDetalhes"
          @keydown.tab="manterFocoModal"
        >
          <!-- Cabeçalho do modal -->
          <div class="flex items-start justify-between gap-4 border-b border-cti-border px-5 py-5 sm:px-6">
            <div class="flex min-w-0 items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cti-cyan/10 text-cti-cyan">
                <i
                  class="fa-solid fa-building"
                  aria-hidden="true"
                ></i>
              </div>

              <div class="min-w-0">
                <p class="text-xs font-semibold tracking-wide text-cti-cyan">
                  DETALHES DO CLIENTE
                </p>

                <h2
                  id="titulo-detalhes-cliente"
                  class="mt-1 break-words text-xl font-bold"
                >
                  {{ exibir(clienteSelecionado.nome_cliente) }}
                </h2>

                <p class="mt-1 text-sm text-cti-muted">
                  Código:
                  {{ exibir(clienteSelecionado.codigo_cliente) }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cti-muted transition hover:bg-cti-cyan/10 hover:text-cti-cyan"
              aria-label="Fechar detalhes"
              @click="fecharDetalhes"
            >
              <i
                class="fa-solid fa-xmark"
                aria-hidden="true"
              ></i>
            </button>
          </div>

          <!-- Conteúdo do modal -->
          <div class="modal-sem-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                v-for="campo in camposDetalhes"
                :key="campo.chave"
                class="rounded-xl border border-cti-border bg-cti-card/70 p-4"
              >
                <div class="flex items-center gap-2">
                  <i
                    :class="campo.icone"
                    class="text-cti-cyan"
                    aria-hidden="true"
                  ></i>

                  <p class="text-xs font-medium text-cti-muted">
                    {{ campo.titulo }}
                  </p>
                </div>

                <p class="mt-2 break-words text-sm font-semibold text-cti-text">
                  {{ campo.valor }}
                </p>
              </div>
            </div>
          </div>

          <!-- Rodapé -->
          <div class="flex justify-end border-t border-cti-border px-5 py-4 sm:px-6">
            <button
              type="button"
              class="rounded-xl bg-cti-cyan px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
              @click="fecharDetalhes"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch
} from "vue";

import { useUploadStore } from "../stores/uploadStore";
import FiltroSelect from "../components/FiltroSelect.vue";
import PaginacaoTabela from "../components/PaginacaoTabela.vue";

const store = useUploadStore();

// Filtros
const busca = ref("");
const segmentoSelecionado = ref("");
const nivelSelecionado = ref("");
const ufSelecionada = ref("");

// Paginação
const paginaAtual = ref(1);
const tamanhoPagina = ref(50);

// Modal
const clienteSelecionado = ref(null);
const modalDetalhes = ref(null);

let elementoAnterior = null;
let overflowAnterior = "";

// Estados brasileiros
const estados = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins"
};

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function exibir(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "—";
  }

  return String(valor);
}

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatarMoeda(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "—";
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "—";
  }

  return formatadorMoeda.format(numero);
}

function nomeUF(sigla) {
  const uf = String(sigla ?? "")
    .trim()
    .toUpperCase();

  return estados[uf]
    ? `${estados[uf]} (${uf})`
    : uf;
}

// Opções de segmento
const segmentos = computed(() => {
  const valores = store.dadosTratados
    .map((cliente) =>
      String(cliente.segmento ?? "").trim()
    )
    .filter(Boolean);

  return [...new Set(valores)].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
});

// Opções de nível
const niveis = computed(() => {
  const valores = store.dadosTratados
    .map((cliente) =>
      String(cliente.nivel_cliente ?? "")
        .trim()
        .toUpperCase()
    )
    .filter(Boolean);

  return [...new Set(valores)].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
});

// Opções de UF
const opcoesUF = computed(() => {
  const valores = store.dadosTratados
    .map((cliente) =>
      String(cliente.uf ?? "")
        .trim()
        .toUpperCase()
    )
    .filter(Boolean);

  return [...new Set(valores)]
    .sort()
    .map((uf) => ({
      valor: uf,
      label: nomeUF(uf)
    }));
});

// Filtros combinados
const clientesFiltrados = computed(() => {
  const termo = normalizar(busca.value);

  return store.dadosTratados.filter((cliente) => {
    const correspondeBusca =
      !termo ||
      normalizar(cliente.nome_cliente).includes(termo) ||
      normalizar(cliente.codigo_cliente).includes(termo);

    const correspondeSegmento =
      !segmentoSelecionado.value ||
      String(cliente.segmento ?? "").trim() ===
        segmentoSelecionado.value;

    const correspondeNivel =
      !nivelSelecionado.value ||
      String(cliente.nivel_cliente ?? "")
        .trim()
        .toUpperCase() === nivelSelecionado.value;

    const correspondeUF =
      !ufSelecionada.value ||
      String(cliente.uf ?? "")
        .trim()
        .toUpperCase() === ufSelecionada.value;

    return (
      correspondeBusca &&
      correspondeSegmento &&
      correspondeNivel &&
      correspondeUF
    );
  });
});

// Paginação
const clientesPaginados = computed(() => {
  const inicio =
    (paginaAtual.value - 1) * tamanhoPagina.value;

  return clientesFiltrados.value.slice(
    inicio,
    inicio + tamanhoPagina.value
  );
});

const quantidadeFiltros = computed(() =>
  [
    busca.value.trim(),
    segmentoSelecionado.value,
    nivelSelecionado.value,
    ufSelecionada.value
  ].filter(Boolean).length
);

// Indicadores dinâmicos
// Ícones atualizados conforme o design aprovado
const indicadores = computed(() => [
  {
    chave: "total",
    titulo: "Clientes na planilha",
    valor: store.totalClientes,
    icone: "fa-solid fa-users",
    corValor: "text-cti-text",
    corIcone: "bg-cti-cyan/10 text-cti-cyan",
    bordaHover: "hover:border-cti-cyan/50",
    descricao: "Registros processados"
  },
  {
    chave: "filtrados",
    titulo: "Resultados encontrados",
    valor: clientesFiltrados.value.length,
    icone: "fa-solid fa-magnifying-glass",
    corValor: "text-green-400",
    corIcone: "bg-green-400/10 text-green-400",
    bordaHover: "hover:border-green-400/50",
    descricao: "Conforme os filtros aplicados"
  },
  {
    chave: "nivel",
    titulo: nivelSelecionado.value
      ? `Clientes nível ${nivelSelecionado.value}`
      : "Clientes",
    valor: clientesFiltrados.value.length,
    icone: "fa-solid fa-user-check",
    corValor: "text-blue-400",
    corIcone: "bg-blue-400/10 text-blue-400",
    bordaHover: "hover:border-blue-400/50",
    descricao: nivelSelecionado.value
      ? `Registros filtrados no nível ${nivelSelecionado.value}`
      : "Clientes na seleção atual"
  }
]);

// Campos do modal de detalhes
const camposDetalhes = computed(() => {
  const cliente = clienteSelecionado.value;

  if (!cliente) return [];

  return [
    {
      chave: "codigo_cliente",
      titulo: "Código do cliente",
      valor: exibir(cliente.codigo_cliente),
      icone: "fa-solid fa-hashtag"
    },
    {
      chave: "nome_cliente",
      titulo: "Nome / Empresa",
      valor: exibir(cliente.nome_cliente),
      icone: "fa-solid fa-building"
    },
    {
      chave: "consultor",
      titulo: "Consultor",
      valor: exibir(cliente.consultor),
      icone: "fa-solid fa-user-tie"
    },
    {
      chave: "segmento",
      titulo: "Segmento",
      valor: exibir(cliente.segmento),
      icone: "fa-solid fa-layer-group"
    },
    {
      chave: "nivel_cliente",
      titulo: "Nível do cliente",
      valor: exibir(cliente.nivel_cliente),
      icone: "fa-solid fa-ranking-star"
    },
    {
      chave: "faturamento_anual",
      titulo: "Faturamento anual",
      valor: formatarMoeda(cliente.faturamento_anual),
      icone: "fa-solid fa-coins"
    },
    {
      chave: "servicos_contratados",
      titulo: "Serviços contratados",
      valor: exibir(cliente.servicos_contratados),
      icone: "fa-solid fa-briefcase"
    },
    {
      chave: "data_contratacao",
      titulo: "Data de contratação",
      valor: exibir(cliente.data_contratacao),
      icone: "fa-solid fa-calendar-days"
    },
    {
      chave: "cidade",
      titulo: "Cidade",
      valor: exibir(cliente.cidade),
      icone: "fa-solid fa-city"
    },
    {
      chave: "uf",
      titulo: "Estado (UF)",
      valor: exibir(cliente.uf),
      icone: "fa-solid fa-map-location-dot"
    }
  ];
});

// Reinicia a página quando algum filtro muda
watch(
  [
    busca,
    segmentoSelecionado,
    nivelSelecionado,
    ufSelecionada
  ],
  () => {
    paginaAtual.value = 1;
  },
  { flush: "sync" }
);

// Reinicia filtros após novo processamento
watch(
  () => store.dadosTratados,
  () => {
    limparFiltros();
    fecharDetalhes();
  }
);

// Evita páginas vazias
watch(
  [() => clientesFiltrados.value.length, tamanhoPagina],
  ([total, tamanho]) => {
    const ultimaPagina = Math.max(
      1,
      Math.ceil(total / tamanho)
    );

    if (paginaAtual.value > ultimaPagina) {
      paginaAtual.value = ultimaPagina;
    }
  }
);

function limparFiltros() {
  busca.value = "";
  segmentoSelecionado.value = "";
  nivelSelecionado.value = "";
  ufSelecionada.value = "";
  paginaAtual.value = 1;
}

// Abrir modal
async function abrirDetalhes(cliente) {
  if (!cliente) return;

  elementoAnterior = document.activeElement;
  clienteSelecionado.value = cliente;

  await nextTick();
  modalDetalhes.value?.focus();
}

// Fechar modal
function fecharDetalhes() {
  if (!clienteSelecionado.value) return;

  clienteSelecionado.value = null;

  nextTick(() => {
    if (elementoAnterior?.isConnected) {
      elementoAnterior.focus();
    }

    elementoAnterior = null;
  });
}

// Controle do foco dentro do modal
function manterFocoModal(evento) {
  const modal = modalDetalhes.value;

  if (!modal) return;

  const elementos = Array.from(
    modal.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );

  if (!elementos.length) {
    evento.preventDefault();
    modal.focus();
    return;
  }

  const primeiro = elementos[0];
  const ultimo = elementos[elementos.length - 1];
  const ativo = document.activeElement;

  if (evento.shiftKey) {
    if (ativo === primeiro || ativo === modal) {
      evento.preventDefault();
      ultimo.focus();
    }
  } else if (ativo === ultimo || ativo === modal) {
    evento.preventDefault();
    primeiro.focus();
  }
}

// Bloqueia a rolagem do fundo durante o modal
watch(
  clienteSelecionado,
  (cliente, anterior) => {
    if (cliente && !anterior) {
      overflowAnterior = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    } else if (!cliente && anterior) {
      document.body.style.overflow = overflowAnterior;
    }
  },
  { flush: "sync" }
);

onBeforeUnmount(() => {
  if (clienteSelecionado.value) {
    document.body.style.overflow = overflowAnterior;
  }
});

// Proteção contra fórmulas maliciosas em CSV
function escaparCSV(valor) {
  let texto = String(valor ?? "");

  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(texto)) {
    texto = "'" + texto;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

// Exportar clientes filtrados
function exportarCSV() {
  if (!clientesFiltrados.value.length) return;

  const colunas = [
    ["Código Cliente", "codigo_cliente"],
    ["Nome Cliente", "nome_cliente"],
    ["Segmento", "segmento"],
    ["Nível Cliente", "nivel_cliente"],
    ["Faturamento Anual", "faturamento_anual"],
    ["Data Contratação", "data_contratacao"],
    ["Cidade", "cidade"],
    ["UF", "uf"]
  ];

  const cabecalho = colunas
    .map(([titulo]) => escaparCSV(titulo))
    .join(";");

  const linhas = clientesFiltrados.value.map((cliente) =>
    colunas
      .map(([, chave]) => escaparCSV(cliente[chave]))
      .join(";")
  );

  const conteudo =
    "\uFEFF" + [cabecalho, ...linhas].join("\r\n");

  const blob = new Blob([conteudo], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "cti-clientes.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
</script>

<style scoped>
.modal-sem-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.modal-sem-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>