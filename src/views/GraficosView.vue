
<template>
  <div class="min-h-screen bg-cti-bg p-4 text-cti-text sm:p-6 lg:p-8">
    <!-- Cabeçalho -->
    <header class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div class="mb-2 flex items-center gap-2 text-sm text-cti-muted">
          <i class="fa-solid fa-chart-column text-cti-cyan" aria-hidden="true"></i>
          <span>CTI Insights / Gráficos</span>
        </div>

        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
          Gráficos e indicadores
        </h1>

        <p class="mt-2 max-w-2xl text-sm leading-6 text-cti-muted sm:text-base">
          Visualize a distribuição dos clientes, acompanhe as contratações
          e analise os resultados da validação da planilha.
        </p>
      </div>

      <div
        v-if="store.temDados"
        class="flex items-center gap-2 rounded-full border border-cti-border bg-cti-card px-3 py-2 text-sm text-cti-muted"
      >
        <span class="h-2 w-2 rounded-full bg-cti-turquoise"></span>
        Dados atualizados
      </div>
    </header>

    <!-- Estado vazio -->
    <section
      v-if="!store.temDados"
      class="rounded-2xl border border-dashed border-cti-border bg-cti-sidebar px-5 py-12 text-center sm:px-8"
    >
      <div
        class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cti-card text-cti-cyan"
      >
        <i class="fa-solid fa-chart-pie text-3xl" aria-hidden="true"></i>
      </div>

      <h2 class="text-lg font-semibold">
        Nenhuma planilha processada
      </h2>

      <p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-cti-muted">
        Para gerar os gráficos, acesse Upload, selecione sua planilha
        e execute o processamento dos dados.
      </p>

      <router-link
        to="/app/upload"
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-cti-cyan px-5 py-3 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-cti-turquoise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cti-cyan"
      >
        <i class="fa-solid fa-upload" aria-hidden="true"></i>
        Ir para Upload
      </router-link>
    </section>

    <template v-else>
      <!-- Indicadores -->
      <section
        class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo dos indicadores"
      >
        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors hover:border-cti-cyan/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Total de clientes</p>
              <p class="mt-3 text-3xl font-bold">{{ store.totalClientes }}</p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-cti-cyan/10 text-cti-cyan">
              <i class="fa-solid fa-users text-lg" aria-hidden="true"></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">Registros processados</p>
        </article>

        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors hover:border-green-400/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Registros válidos</p>
              <p class="mt-3 text-3xl font-bold text-green-400">
                {{ store.totalValidados }}
              </p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
              <i class="fa-solid fa-circle-check text-lg" aria-hidden="true"></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">Sem inconsistências</p>
        </article>

        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors hover:border-red-400/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Registros inválidos</p>
              <p class="mt-3 text-3xl font-bold text-red-400">
                {{ store.totalInvalidados }}
              </p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
              <i class="fa-solid fa-triangle-exclamation text-lg" aria-hidden="true"></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">Precisam de revisão</p>
        </article>

        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors hover:border-amber-400/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Total de erros</p>
              <p class="mt-3 text-3xl font-bold text-amber-400">
                {{ store.totalErros }}
              </p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <i class="fa-solid fa-bug text-lg" aria-hidden="true"></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">Ocorrências identificadas</p>
        </article>
      </section>

      <!-- Arquivo analisado -->
      <section
        class="mb-8 flex flex-col gap-3 rounded-2xl border border-cti-border bg-cti-sidebar p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cti-card text-cti-cyan">
            <i class="fa-solid fa-file-excel text-xl" aria-hidden="true"></i>
          </div>

          <div class="min-w-0">
            <p class="text-sm text-cti-muted">Arquivo analisado</p>
            <p class="break-words font-semibold">{{ store.nomeArquivo }}</p>
            <p class="mt-1 text-xs text-cti-muted">{{ store.statusValidacao }}</p>
          </div>
        </div>

        <div class="sm:text-right">
          <p class="text-sm text-cti-muted">Percentual de registros válidos</p>
          <p class="mt-1 text-2xl font-bold text-cti-cyan">
            {{ store.percentualValido }}%
          </p>
        </div>
      </section>

      <!-- Gráficos de clientes -->
      <section class="mb-8">
        <div class="mb-4">
          <h2 class="text-xl font-bold">Perfil dos clientes</h2>
          <p class="mt-1 text-sm text-cti-muted">
            Distribuição dos registros conforme os dados da planilha.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <!-- Clientes por segmento -->
          <article class="min-w-0 rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6">
            <div class="mb-5">
              <h3 class="font-semibold">Clientes por segmento</h3>
              <p class="mt-1 text-sm text-cti-muted">
                Quantidade de clientes em cada segmento.
              </p>
            </div>

            <div
              v-if="!dadosSegmentos.length"
              class="py-10 text-center text-sm text-cti-muted"
            >
              Não há segmentos preenchidos para exibir.
            </div>

            <div v-else class="relative mx-auto h-72 max-w-md">
              <canvas
                ref="segmentoCanvas"
                aria-label="Gráfico de clientes por segmento"
              ></canvas>
            </div>
          </article>

          <!-- Clientes por nível -->
          <article class="min-w-0 rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6">
            <div class="mb-5">
              <h3 class="font-semibold">Clientes por nível</h3>
              <p class="mt-1 text-sm text-cti-muted">
                Comparação entre os níveis A, B e C.
              </p>
            </div>

            <div class="relative h-72">
              <canvas
                ref="nivelCanvas"
                aria-label="Gráfico de clientes por nível"
              ></canvas>
            </div>
          </article>
        </div>
      </section>

      <!-- Contratações por mês -->
      <section class="mb-8 rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6">
        <div class="mb-5">
          <h2 class="font-semibold">Evolução das contratações</h2>
          <p class="mt-1 text-sm text-cti-muted">
            Quantidade de registros agrupados por mês e ano de contratação.
          </p>
        </div>

        <div
          v-if="!dadosContratacoes.length"
          class="rounded-xl border border-dashed border-cti-border p-8 text-center text-sm leading-6 text-cti-muted"
        >
          Não há datas de contratação válidas suficientes para montar este gráfico.
        </div>

        <div v-else class="relative h-72">
          <canvas
            ref="contratacaoCanvas"
            aria-label="Gráfico de evolução das contratações"
          ></canvas>
        </div>
      </section>

      <!-- Resultados da validação -->
      <section class="mb-8">
        <div class="mb-4">
          <h2 class="text-xl font-bold">Resultados da validação</h2>
          <p class="mt-1 text-sm text-cti-muted">
            Visualize a qualidade dos registros e as inconsistências encontradas.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <!-- Válidos e inválidos -->
          <article class="min-w-0 rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6">
            <div class="mb-5">
              <h3 class="font-semibold">Registros válidos e inválidos</h3>
              <p class="mt-1 text-sm text-cti-muted">
                Comparação dos resultados da validação.
              </p>
            </div>

            <div
              v-if="!store.totalClientes"
              class="py-10 text-center text-sm text-cti-muted"
            >
              Nenhum registro disponível.
            </div>

            <div v-else class="relative mx-auto h-72 max-w-md">
              <canvas
                ref="validacaoCanvas"
                aria-label="Gráfico de registros válidos e inválidos"
              ></canvas>
            </div>
          </article>

          <!-- Erros por categoria -->
          <article class="min-w-0 rounded-2xl border border-cti-border bg-cti-card p-5 sm:p-6">
            <div class="mb-5">
              <h3 class="font-semibold">Erros por categoria</h3>
              <p class="mt-1 text-sm text-cti-muted">
                Quantidade de ocorrências em cada tipo de erro.
              </p>
            </div>

            <div
              v-if="!tiposErrosGrafico.length"
              class="rounded-xl border border-green-400/20 bg-green-400/5 p-5 text-sm text-green-400"
            >
              <i class="fa-solid fa-circle-check mr-2" aria-hidden="true"></i>
              Nenhum erro registrado nesta validação.
            </div>

            <div v-else class="relative h-72">
              <canvas
                ref="errosCanvas"
                aria-label="Gráfico de erros por categoria"
              ></canvas>
            </div>
          </article>
        </div>
      </section>

      <!-- Acesso ao relatório detalhado -->
      <section class="flex flex-col gap-4 rounded-2xl border border-cti-border bg-cti-sidebar p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 class="font-semibold">Precisa investigar uma inconsistência?</h2>
          <p class="mt-1 text-sm leading-6 text-cti-muted">
            Consulte as linhas, os campos e as descrições dos erros no relatório detalhado.
          </p>
        </div>

        <router-link
          to="/app/relatorios"
          class="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-cti-border bg-cti-card px-4 py-3 text-sm font-semibold transition-colors hover:border-cti-cyan hover:text-cti-cyan"
        >
          <i class="fa-solid fa-file-lines" aria-hidden="true"></i>
          Ver relatório
          <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
        </router-link>
      </section>
    </template>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

import Chart from "chart.js/auto";
import { useUploadStore } from "../stores/uploadStore";

const store = useUploadStore();

const segmentoCanvas = ref(null);
const nivelCanvas = ref(null);
const contratacaoCanvas = ref(null);
const validacaoCanvas = ref(null);
const errosCanvas = ref(null);

let graficos = [];

const cores = {
  cyan: "#22D3EE",
  turquoise: "#2DD4BF",
  green: "#4ADE80",
  red: "#F87171",
  amber: "#FBBF24",
  blue: "#60A5FA",
  purple: "#A78BFA",
  pink: "#F472B6",
  muted: "#94A3B8",
  grid: "rgba(148, 163, 184, 0.16)",
};

const paleta = [
  cores.cyan,
  cores.turquoise,
  cores.blue,
  cores.purple,
  cores.green,
  cores.amber,
  cores.pink,
  "#818CF8",
];

// Agrupa os clientes por segmento.
const dadosSegmentos = computed(() => {
  const contagem = {};

  store.dadosTratados.forEach((cliente) => {
    const segmento = String(cliente.segmento ?? "").trim();

    if (segmento) {
      contagem[segmento] = (contagem[segmento] || 0) + 1;
    }
  });

  return Object.entries(contagem).sort((a, b) => b[1] - a[1]);
});

// Agrupa somente datas que existem no calendário, por mês e ano.
const dadosContratacoes = computed(() => {
  const contagem = {};

  store.dadosTratados.forEach((cliente) => {
    const data = String(cliente.data_contratacao ?? "").trim();

    // Exige o formato DD/MM/AAAA.
    const correspondencia = data.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (!correspondencia) return;

    const dia = Number(correspondencia[1]);
    const mes = Number(correspondencia[2]);
    const ano = Number(correspondencia[3]);

    // O construtor de data pode ajustar dias e meses inválidos.
    // Por isso, comparamos os valores resultantes com os originais.
    const dataValida = new Date(Date.UTC(ano, mes - 1, dia));

    if (
      dataValida.getUTCFullYear() !== ano ||
      dataValida.getUTCMonth() !== mes - 1 ||
      dataValida.getUTCDate() !== dia
    ) {
      return;
    }

    const chave = `${ano}-${String(mes).padStart(2, "0")}`;

    contagem[chave] = (contagem[chave] || 0) + 1;
  });

  // Ordena cronologicamente no formato AAAA-MM.
  return Object.entries(contagem).sort(([a], [b]) =>
    a.localeCompare(b)
  );
});

// Prepara os tipos de erros para o gráfico.
const tiposErrosGrafico = computed(() =>
  Object.entries(store.tiposErros)
    .filter(([, quantidade]) => quantidade > 0)
    .sort((a, b) => b[1] - a[1])
);

function opcoesComuns() {
  return {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: cores.muted,
          padding: 18,
          usePointStyle: true,
        },
      },

      tooltip: {
        enabled: true,
      },
    },
  };
}

function destruirGraficos() {
  graficos.forEach((grafico) => grafico.destroy());
  graficos = [];
}

function adicionarGrafico(canvas, configuracao) {
  if (!canvas) return;

  const grafico = new Chart(canvas, configuracao);
  graficos.push(grafico);
}

function criarGraficos() {
  destruirGraficos();

  if (!store.temDados) return;

  const opcoes = opcoesComuns();

  // Gráfico de clientes por segmento.
  if (dadosSegmentos.value.length && segmentoCanvas.value) {
    adicionarGrafico(segmentoCanvas.value, {
      type: "doughnut",

      data: {
        labels: dadosSegmentos.value.map(([nome]) => nome),

        datasets: [
          {
            data: dadosSegmentos.value.map(([, quantidade]) => quantidade),
            backgroundColor: paleta,
            borderColor: "#172235",
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },

      options: {
        ...opcoes,
        cutout: "62%",
      },
    });
  }

  // Gráfico de clientes por nível.
  if (nivelCanvas.value) {
    const niveis = ["A", "B", "C"];

    const quantidades = niveis.map((nivel) =>
      store.dadosTratados.filter(
        (cliente) =>
          String(cliente.nivel_cliente ?? "").trim().toUpperCase() === nivel
      ).length
    );

    adicionarGrafico(nivelCanvas.value, {
      type: "bar",

      data: {
        labels: niveis.map((nivel) => `Nível ${nivel}`),

        datasets: [
          {
            label: "Clientes",
            data: quantidades,
            backgroundColor: [cores.green, cores.cyan, cores.purple],
            borderRadius: 8,
            maxBarThickness: 64,
          },
        ],
      },

      options: {
        ...opcoes,

        scales: {
          x: {
            ticks: { color: cores.muted },
            grid: { display: false },
          },

          y: {
            beginAtZero: true,
            ticks: {
              color: cores.muted,
              precision: 0,
            },
            grid: { color: cores.grid },
          },
        },
      },
    });
  }

  // Gráfico de evolução das contratações por mês.
  if (dadosContratacoes.value.length && contratacaoCanvas.value) {
    const nomesMeses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const rotulos = dadosContratacoes.value.map(([chave]) => {
      const [ano, mes] = chave.split("-");

      return `${nomesMeses[Number(mes) - 1]}/${ano}`;
    });

    adicionarGrafico(contratacaoCanvas.value, {
      type: "line",

      data: {
        labels: rotulos,

        datasets: [
          {
            label: "Contratações",
            data: dadosContratacoes.value.map(([, quantidade]) => quantidade),
            borderColor: cores.cyan,
            backgroundColor: "rgba(34, 211, 238, 0.12)",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: cores.turquoise,
            pointRadius: 4,
          },
        ],
      },

      options: {
        ...opcoes,

        scales: {
          x: {
            ticks: { color: cores.muted },
            grid: { display: false },
          },

          y: {
            beginAtZero: true,
            ticks: {
              color: cores.muted,
              precision: 0,
            },
            grid: { color: cores.grid },
          },
        },
      },
    });
  }

  // Gráfico de registros válidos e inválidos.
  if (validacaoCanvas.value) {
    adicionarGrafico(validacaoCanvas.value, {
      type: "doughnut",

      data: {
        labels: ["Válidos", "Inválidos"],

        datasets: [
          {
            data: [store.totalValidados, store.totalInvalidados],
            backgroundColor: [cores.green, cores.red],
            borderColor: "#172235",
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },

      options: {
        ...opcoes,
        cutout: "62%",
      },
    });
  }

  // Gráfico de erros por categoria.
  if (tiposErrosGrafico.value.length && errosCanvas.value) {
    adicionarGrafico(errosCanvas.value, {
      type: "bar",

      data: {
        labels: tiposErrosGrafico.value.map(([tipo]) => tipo),

        datasets: [
          {
            label: "Ocorrências",
            data: tiposErrosGrafico.value.map(([, quantidade]) => quantidade),
            backgroundColor: cores.amber,
            borderRadius: 6,
            maxBarThickness: 48,
          },
        ],
      },

      options: {
        ...opcoes,
        indexAxis: "y",

        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: cores.muted,
              precision: 0,
            },
            grid: { color: cores.grid },
          },

          y: {
            ticks: { color: cores.muted },
            grid: { display: false },
          },
        },
      },
    });
  }
}

async function atualizarGraficos() {
  await nextTick();
  criarGraficos();
}

onMounted(() => {
  atualizarGraficos();
});

watch(
  () => [
    store.dadosTratados,
    store.dadosValidados,
    store.dadosInvalidados,
    store.tiposErros,
  ],
  atualizarGraficos,
  { deep: true }
);

onBeforeUnmount(() => {
  destruirGraficos();
});
</script>