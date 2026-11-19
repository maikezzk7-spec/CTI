<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";

import { RouterLink } from "vue-router";
import Chart from "chart.js/auto";
import * as echarts from "echarts/core";
import { MapChart } from "echarts/charts";
import {
  TooltipComponent,
  VisualMapComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

import { useUploadStore } from "../stores/uploadStore.js";
import mapaBrasil from "../assets/maps/brazil-states.geojson?raw";

echarts.use([
  MapChart,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer
]);

const store = useUploadStore();
const dadosGeograficosBrasil = JSON.parse(mapaBrasil);

const canvasNiveis = ref(null);
const canvasSegmentos = ref(null);
const canvasValidacao = ref(null);
const elementoMapa = ref(null);
const elementoLegendaMapa = ref(null);
const ufEmDestaque = ref(null);

const graficos = [];
const movimentoReduzido = ref(false);

let instanciaMapa = null;
let instanciaLegendaMapa = null;
let observadorMapa = null;
let consultaMovimento = null;
let atualizacaoPendente = 0;

// ============================================
// DADOS DA PLANILHA
// ============================================

const totalClientes = computed(() => store.totalClientes);
const totalValidos = computed(() => store.totalValidados);
const totalInvalidos = computed(() => store.totalInvalidados);
const percentualValido = computed(() => store.percentualValido);
const clientes = computed(() => store.dadosTratados || []);

const formatarNumero = (valor) =>
  new Intl.NumberFormat("pt-BR").format(Number(valor) || 0);

function texto(valor) {
  return String(valor ?? "").trim() || "Não informado";
}

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

const nomesUF = {
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

const nomeParaUF = Object.fromEntries(
  Object.entries(nomesUF).map(([uf, nome]) => [
    normalizar(nome),
    uf
  ])
);

function obterUF(valor) {
  const chave = normalizar(valor);

  if (Object.hasOwn(nomesUF, chave)) {
    return chave;
  }

  return nomeParaUF[chave] || null;
}

function contarPorCampo(campo) {
  const contagem = new Map();

  for (const cliente of clientes.value) {
    const valor = texto(cliente[campo]).toUpperCase();

    contagem.set(
      valor,
      (contagem.get(valor) || 0) + 1
    );
  }

  return [...contagem.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.nome.localeCompare(b.nome)
    );
}

const niveis = computed(() =>
  contarPorCampo("nivel_cliente")
);

const segmentos = computed(() =>
  contarPorCampo("segmento")
);

const estados = computed(() => {
  const contagem = new Map();

  for (const cliente of clientes.value) {
    const uf = obterUF(cliente.uf);

    if (!uf) continue;

    contagem.set(
      uf,
      (contagem.get(uf) || 0) + 1
    );
  }

  return [...contagem.entries()]
    .map(([uf, total]) => ({
      uf,
      nome: nomesUF[uf],
      total
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        a.nome.localeCompare(b.nome)
    );
});

const totalEstados = computed(() => estados.value.length);

const totalSegmentos = computed(
  () =>
    segmentos.value.filter(
      (item) => item.nome !== "NÃO INFORMADO"
    ).length
);

const clientesResumo = computed(() =>
  clientes.value.slice(0, 6)
);

const errosResumo = computed(() =>
  Object.entries(store.tiposErros || {})
    .map(([nome, valor]) => ({
      nome,
      total: Number(valor) || 0
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
);

// ============================================
// CARDS PRINCIPAIS
// ============================================

const indicadores = computed(() => [
  {
    titulo: "Total de clientes",
    valor: formatarNumero(totalClientes.value),
    icone: "fa-users",
    cor: "#22D3EE"
  },
  {
    titulo: "Registros válidos",
    valor: formatarNumero(totalValidos.value),
    icone: "fa-circle-check",
    cor: "#34D399"
  },
  {
    titulo: "Registros inválidos",
    valor: formatarNumero(totalInvalidos.value),
    icone: "fa-triangle-exclamation",
    cor: "#FB923C"
  },
  {
    titulo: "Taxa de aprovação",
    valor: percentualValido.value + "%",
    icone: "fa-chart-line",
    cor: "#60A5FA"
  }
]);

// ============================================
// INDICADORES EXECUTIVOS
// ============================================

const ufLider = computed(() => estados.value[0] || null);

const totalClientesComUF = computed(() =>
  estados.value.reduce(
    (total, estado) => total + estado.total,
    0
  )
);

const percentualUFLider = computed(() => {
  if (!ufLider.value || !totalClientesComUF.value) {
    return 0;
  }

  return (
    (ufLider.value.total / totalClientesComUF.value) *
    100
  ).toFixed(1);
});

const nivelPredominante = computed(
  () =>
    niveis.value.find(
      (item) => item.nome !== "NÃO INFORMADO"
    ) || null
);

const segmentoPredominante = computed(
  () =>
    segmentos.value.find(
      (item) => item.nome !== "NÃO INFORMADO"
    ) || null
);

// Classificação visual — não altera a validação real.
const statusQualidade = computed(() => {
  const percentual = Number(percentualValido.value) || 0;

  if (percentual >= 90) {
    return {
      titulo: "Excelente",
      descricao: "A planilha apresenta alta taxa de aprovação.",
      cor: "#34D399",
      icone: "fa-shield-halved"
    };
  }

  if (percentual >= 70) {
    return {
      titulo: "Boa",
      descricao: "A maior parte dos registros foi aprovada.",
      cor: "#22D3EE",
      icone: "fa-circle-check"
    };
  }

  if (percentual >= 50) {
    return {
      titulo: "Atenção",
      descricao: "Uma parcela importante dos registros precisa de revisão.",
      cor: "#FBBF24",
      icone: "fa-circle-exclamation"
    };
  }

  return {
    titulo: "Crítica",
    descricao: "A planilha apresenta muitos registros inválidos.",
    cor: "#FB7185",
    icone: "fa-triangle-exclamation"
  };
});

const resumoExecutivo = computed(() => {
  const resumo = [];

  if (nivelPredominante.value) {
    resumo.push({
      titulo: "Nível predominante",
      descricao:
        `${nivelPredominante.value.nome} concentra ` +
        `${formatarNumero(nivelPredominante.value.total)} clientes.`,
      icone: "fa-ranking-star",
      cor: "#22D3EE"
    });
  }

  if (segmentoPredominante.value) {
    resumo.push({
      titulo: "Segmento predominante",
      descricao:
        `${segmentoPredominante.value.nome} possui ` +
        `${formatarNumero(segmentoPredominante.value.total)} clientes.`,
      icone: "fa-layer-group",
      cor: "#60A5FA"
    });
  }

  if (ufLider.value) {
    resumo.push({
      titulo: "Concentração geográfica",
      descricao:
        `${ufLider.value.nome} lidera com ` +
        `${formatarNumero(ufLider.value.total)} clientes ` +
        `(${percentualUFLider.value}% dos registros com UF reconhecida).`,
      icone: "fa-map-location-dot",
      cor: "#34D399"
    });
  }

  resumo.push({
    titulo: "Qualidade da importação",
    descricao:
      `${formatarNumero(totalValidos.value)} registros válidos ` +
      `e ${formatarNumero(totalInvalidos.value)} inválidos.`,
    icone: "fa-clipboard-check",
    cor: statusQualidade.value.cor
  });

  return resumo;
});

const acoesRapidas = [
  {
    titulo: "Nova planilha",
    descricao: "Importar outro arquivo",
    rota: "/app/upload",
    icone: "fa-cloud-arrow-up",
    cor: "#22D3EE"
  },
  {
    titulo: "Relatórios",
    descricao: "Consultar validações",
    rota: "/app/relatorios",
    icone: "fa-file-lines",
    cor: "#34D399"
  },
  {
    titulo: "Consultar clientes",
    descricao: "Visualizar registros",
    rota: "/app/clientes",
    icone: "fa-users",
    cor: "#60A5FA"
  }
];

// ============================================
// CHART.JS — CONFIGURAÇÕES
// ============================================

const cores = [
  "#22D3EE",
  "#3B82F6",
  "#14B8A6",
  "#8B5CF6",
  "#F59E0B",
  "#F97316",
  "#EC4899",
  "#64748B"
];

function destruirGraficos() {
  for (const grafico of graficos) {
    grafico.destroy();
  }

  graficos.length = 0;
}

function criarGrafico(canvas, configuracao) {
  if (!canvas) return;
  graficos.push(new Chart(canvas, configuracao));
}

function configuracaoBase() {
  return {
    responsive: true,
    maintainAspectRatio: false,

    animation: movimentoReduzido.value
      ? false
      : {
          duration: 850,
          easing: "easeOutQuart"
        },

    interaction: {
      mode: "nearest",
      intersect: true
    },

    plugins: {
      legend: {
        labels: {
          color: "#CBD5E1",
          usePointStyle: true
        }
      },

      tooltip: {
        enabled: true,
        backgroundColor: "#101D32",
        titleColor: "#FFFFFF",
        bodyColor: "#E2E8F0",
        borderColor: "rgba(34,211,238,0.35)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10
      }
    }
  };
}

// ============================================
// CHART.JS — GRÁFICOS
// ============================================

function atualizarGraficos() {
  destruirGraficos();

  if (!store.temDados) return;

  const base = configuracaoBase();

  // Clientes por nível
  criarGrafico(canvasNiveis.value, {
    type: "bar",

    data: {
      labels: niveis.value.map((item) => item.nome),

      datasets: [
        {
          label: "Clientes",
          data: niveis.value.map((item) => item.total),
          backgroundColor: "#22D3EE",
          hoverBackgroundColor: "#67E8F9",
          borderRadius: 7,
          maxBarThickness: 45
        }
      ]
    },

    options: {
      ...base,

      plugins: {
        ...base.plugins,
        legend: { display: false }
      },

      scales: {
        x: {
          ticks: { color: "#CBD5E1" },
          grid: { display: false }
        },

        y: {
          beginAtZero: true,

          ticks: {
            color: "#94A3B8",
            precision: 0
          },

          grid: {
            color: "rgba(148,163,184,0.12)"
          }
        }
      }
    }
  });

  // Clientes por segmento
  criarGrafico(canvasSegmentos.value, {
    type: "doughnut",

    data: {
      labels: segmentos.value.map((item) => item.nome),

      datasets: [
        {
          data: segmentos.value.map((item) => item.total),

          backgroundColor: segmentos.value.map(
            (_, indice) => cores[indice % cores.length]
          ),

          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: "#101D32",
          hoverOffset: 12
        }
      ]
    },

    options: {
      ...base,
      cutout: "68%",

      plugins: {
        ...base.plugins,

        legend: {
          position: "bottom",

          labels: {
            color: "#CBD5E1",
            usePointStyle: true,
            boxWidth: 10,
            padding: 14
          }
        }
      }
    }
  });

  // Qualidade dos dados
  criarGrafico(canvasValidacao.value, {
    type: "doughnut",

    data: {
      labels: ["Válidos", "Inválidos"],

      datasets: [
        {
          data: [
            totalValidos.value,
            totalInvalidos.value
          ],

          backgroundColor: [
            "#14B8A6",
            "#F97373"
          ],

          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverBorderColor: "#101D32",
          hoverOffset: 12
        }
      ]
    },

    options: {
      ...base,
      cutout: "76%",

      plugins: {
        ...base.plugins,

        legend: {
          position: "bottom",

          labels: {
            color: "#CBD5E1",
            usePointStyle: true,
            padding: 16
          }
        }
      }
    }
  });
}

// ============================================
// MAPA DO BRASIL — ECHARTS
// ============================================

const regioesMapa = (dadosGeograficosBrasil.features || [])
  .map((feature) => {
    const propriedades = feature.properties || {};

    const candidatos = [
      propriedades.sigla,
      propriedades.uf,
      propriedades.UF,
      propriedades.abbrev,
      propriedades.name,
      propriedades.nome,
      propriedades.NAME_1,
      feature.id
    ];

    const uf = candidatos
      .map(obterUF)
      .find(Boolean);

    if (!uf) return null;

    return {
      ...feature,
      properties: {
        ...propriedades,
        name: uf
      }
    };
  })
  .filter(Boolean);

const ufsNoMapa = new Set(
  regioesMapa.map(
    (feature) => feature.properties.name
  )
);

const mapaDisponivel =
  regioesMapa.length === 27 &&
  ufsNoMapa.size === 27;

if (mapaDisponivel) {
  echarts.registerMap("cti-brasil", {
    type: "FeatureCollection",
    features: regioesMapa
  });
} else {
  console.warn(
    "[CTI Insights] Não foi possível reconhecer as 27 UFs.",
    {
      regioes: regioesMapa.length,
      ufs: [...ufsNoMapa]
    }
  );
}

const dadosMapa = computed(() => {
  const contagem = Object.fromEntries(
    estados.value.map((estado) => [
      estado.uf,
      estado.total
    ])
  );

  return Object.keys(nomesUF).map((uf) => ({
    name: uf,
    value: contagem[uf] || 0
  }));
});

const maiorQuantidadeUF = computed(() =>
  Math.max(
    1,
    ...dadosMapa.value.map((estado) => estado.value)
  )
);


const posicaoLegendaUF = computed(() => {
  if (!ufEmDestaque.value) return 0;

  const proporcao = Math.min(
    1,
    Math.max(
      0,
      ufEmDestaque.value.total / maiorQuantidadeUF.value
    )
  );

  return proporcao * 100;
});

function destruirMapa() {
  ufEmDestaque.value = null;
  observadorMapa?.disconnect();
  observadorMapa = null;

  instanciaLegendaMapa?.dispose();
  instanciaLegendaMapa = null;

  if (instanciaMapa) {
    instanciaMapa.dispose();
    instanciaMapa = null;
  }
}

function atualizarMapa() {
  if (!store.temDados || !mapaDisponivel) {
    destruirMapa();
    return;
  }

  if (!elementoMapa.value) return;

  if (!instanciaMapa) {
    instanciaMapa = echarts.init(
      elementoMapa.value,
      null,
      { renderer: "canvas" }
    );

    // A legenda acompanha o estado apontado, sem alterar o mapa.
    instanciaMapa.on("mouseover", (params) => {
      if (params.componentType !== "series" || params.seriesType !== "map") return;
      ufEmDestaque.value = { uf: params.name, total: Number(params.value) || 0 };
    });
    instanciaMapa.on("mouseout", (params) => {
      if (params.componentType === "series" && params.seriesType === "map") {
        ufEmDestaque.value = null;
      }
    });
    instanciaMapa.getZr().on("globalout", () => {
      ufEmDestaque.value = null;
    });

    if (typeof ResizeObserver !== "undefined") {
      observadorMapa = new ResizeObserver(() => {
        instanciaMapa?.resize();
        instanciaLegendaMapa?.resize();
      });

      observadorMapa.observe(elementoMapa.value);
      if (elementoLegendaMapa.value) {
        observadorMapa.observe(elementoLegendaMapa.value);
      }
    }
  }

  // Escala nativa preservada fora do mapa; o indicador acompanha o hover da UF.
  if (elementoLegendaMapa.value && !instanciaLegendaMapa) {
    instanciaLegendaMapa = echarts.init(
      elementoLegendaMapa.value,
      null,
      { renderer: "canvas" }
    );
  }

  instanciaLegendaMapa?.setOption({
    backgroundColor: "transparent",
    animation: !movimentoReduzido.value,
    visualMap: {
      min: 0,
      max: maiorQuantidadeUF.value,
      show: true,
      calculable: false,
      orient: "horizontal",
      left: "center",
      top: "middle",
      text: ["Mais clientes", "Menos clientes"],
      textStyle: { color: "#94A3B8", fontSize: 11 },
      itemWidth: 13,
      itemHeight: 90,
      inRange: {
        color: ["#243B53", "#155E75", "#0891B2", "#22D3EE"]
      }
    },
    // Série invisível necessária para vincular o visualMap aos mesmos dados.
    series: [{
      type: "map",
      map: "cti-brasil",
      roam: false,
      silent: true,
      layoutCenter: ["50%", "50%"],
      layoutSize: "1%",
      label: { show: false },
      itemStyle: { opacity: 0, borderWidth: 0 },
      emphasis: { disabled: true },
      data: dadosMapa.value
    }]
  }, true);

  instanciaMapa.setOption(
    {
      backgroundColor: "transparent",
      animation: !movimentoReduzido.value,
      animationDuration: 700,

      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: "#101D32",
        borderColor: "#22D3EE",
        borderWidth: 1,

        textStyle: {
          color: "#F8FAFC",
          fontSize: 13
        },

        formatter(params) {
          const uf = params.name;
          const quantidade = Number(params.value) || 0;

          return [
            `<strong>${nomesUF[uf] || uf} (${uf})</strong>`,
            `${formatarNumero(quantidade)} cliente${quantidade === 1 ? "" : "s"}`
          ].join("<br/>");
        }
      },

      // A escala de cores permanece ativa, mas a legenda visual
      // fica em uma faixa independente abaixo do mapa.
      visualMap: {
        min: 0,
        max: maiorQuantidadeUF.value,
        show: false,
        calculable: false,
        inRange: {
          color: [
            "#243B53",
            "#155E75",
            "#0891B2",
            "#22D3EE"
          ]
        }
      },

      series: [
        {
          name: "Clientes por UF",
          type: "map",
          map: "cti-brasil",

          roam: false,
          selectedMode: false,

          // Mapa centralizado: a legenda agora ocupa outra faixa.
          // 90% mantém uma margem de segurança dentro do canvas.
          layoutCenter: ["50%", "50%"],
          layoutSize: "90%",

          label: {
            show: false,
            color: "#FFFFFF",
            fontSize: 10
          },

          itemStyle: {
            areaColor: "#243B53",
            borderColor: "#64748B",
            borderWidth: 0.8
          },

          emphasis: {
            label: {
              show: true,
              color: "#FFFFFF",
              fontWeight: "bold"
            },

            itemStyle: {
              areaColor: "#38BDF8",
              borderColor: "#E0F2FE",
              borderWidth: 1.5
            }
          },

          data: dadosMapa.value
        }
      ]
    },
    true
  );
}

// ============================================
// CICLO DE VIDA
// ============================================

async function atualizarVisualizacoes() {
  const numeroAtualizacao = ++atualizacaoPendente;

  destruirGraficos();

  if (!store.temDados) {
    destruirMapa();
    return;
  }

  await nextTick();

  if (
    numeroAtualizacao !== atualizacaoPendente ||
    !store.temDados
  ) {
    return;
  }

  atualizarGraficos();
  atualizarMapa();
}

function atualizarPreferenciaMovimento(evento) {
  movimentoReduzido.value = evento.matches;
}

watch(
  () => [
    store.dadosTratados,
    store.dadosValidados,
    store.dadosInvalidados,
    movimentoReduzido.value
  ],
  atualizarVisualizacoes,
  { flush: "post" }
);

onMounted(() => {
  consultaMovimento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  movimentoReduzido.value = consultaMovimento.matches;

  consultaMovimento.addEventListener?.(
    "change",
    atualizarPreferenciaMovimento
  );

  atualizarVisualizacoes();
});

onBeforeUnmount(() => {
  atualizacaoPendente++;

  destruirGraficos();
  destruirMapa();

  consultaMovimento?.removeEventListener?.(
    "change",
    atualizarPreferenciaMovimento
  );
});
</script>

<template>
  <section class="w-full min-w-0 space-y-6">
    <!-- ===================================== -->
    <!-- CABEÇALHO -->
    <!-- ===================================== -->
    <header>
      <p class="text-sm font-medium text-cti-cyan">
        CTI Insights / Dashboard
      </p>

      <h1 class="mt-2 text-3xl font-bold text-cti-text">
        Dashboard
      </h1>

      <p class="mt-2 text-cti-muted">
        Visão executiva dos indicadores da planilha atual.
      </p>
    </header>

    <!-- ===================================== -->
    <!-- ESTADO VAZIO -->
    <!-- ===================================== -->
    <section
      v-if="!store.temDados"
      class="rounded-2xl border border-dashed border-cti-border bg-cti-sidebar px-5 py-12 text-center sm:px-8"
    >
      <div
        class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-cti-card text-cti-cyan"
      >
        <i
          class="fa-solid fa-chart-line text-3xl"
          aria-hidden="true"
        ></i>
      </div>

      <h2 class="text-xl font-semibold text-cti-text">
        Nenhum dado disponível
      </h2>

      <p class="mx-auto mt-3 max-w-lg text-sm leading-6 text-cti-muted">
        Importe uma planilha para visualizar os indicadores,
        gráficos e informações dos clientes.
      </p>

      <RouterLink
        to="/app/upload"
        class="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-cti-cyan px-5 py-3 text-sm font-semibold text-cti-sidebar transition hover:opacity-90"
      >
        <i
          class="fa-solid fa-cloud-arrow-up"
          aria-hidden="true"
        ></i>
        Ir para Upload
      </RouterLink>
    </section>

    <template v-else>
      <!-- ===================================== -->
      <!-- PLANILHA ATUAL -->
      <!-- ===================================== -->
      <div
        class="flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border border-cti-border bg-cti-sidebar px-5 py-4"
      >
        <i
          class="fa-solid fa-file-excel text-xl text-cti-cyan"
          aria-hidden="true"
        ></i>

        <div class="min-w-0 flex-1">
          <p class="text-xs text-cti-muted">
            Planilha atual
          </p>

          <p class="truncate font-semibold text-cti-text">
            {{ store.nomeArquivo }}
          </p>
        </div>

        <RouterLink
          to="/app/upload"
          class="inline-flex items-center gap-2 rounded-lg border border-cti-border px-3 py-2 text-sm font-medium text-cti-text transition-all duration-200 hover:border-cti-cyan hover:bg-cti-cyan/10 hover:text-cti-cyan"
        >
          <i
            class="fa-solid fa-cloud-arrow-up"
            aria-hidden="true"
          ></i>
          Nova planilha
        </RouterLink>
      </div>

      <!-- ===================================== -->
      <!-- CARDS PRINCIPAIS -->
      <!-- ===================================== -->
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article
          v-for="indicador in indicadores"
          :key="indicador.titulo"
          class="dashboard-card indicador-card rounded-2xl border border-cti-border bg-cti-sidebar p-5 transition-all duration-300 hover:-translate-y-0.5 motion-reduce:transform-none"
          :style="{ '--indicador-cor': indicador.cor }"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-medium text-cti-muted">
              {{ indicador.titulo }}
            </p>

            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              :style="{
                color: indicador.cor,
                backgroundColor: indicador.cor + '15'
              }"
            >
              <i
                :class="['fa-solid', indicador.icone]"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <p class="mt-4 text-3xl font-bold text-cti-text">
            {{ indicador.valor }}
          </p>

          <p class="mt-2 text-xs text-cti-muted">
            Dados da importação atual
          </p>
        </article>
      </div>

      <!-- ===================================== -->
      <!-- GRÁFICOS PRINCIPAIS -->
      <!-- ===================================== -->
      <div
        class="grid grid-cols-1 gap-5 xl:grid-cols-2"
      >
        <article
          class="dashboard-card min-w-0 rounded-2xl border border-cti-border bg-cti-sidebar p-5 transition-all duration-300 hover:border-cti-cyan/40 hover:shadow-lg hover:shadow-cyan-950/15"
        >
          <h2 class="font-semibold text-cti-text">
            Clientes por nível
          </h2>

          <p class="mt-1 text-sm text-cti-muted">
            Distribuição por classificação.
          </p>

          <div class="relative mt-6 h-72">
            <canvas ref="canvasNiveis"></canvas>
          </div>
        </article>

        <article
          class="dashboard-card min-w-0 rounded-2xl border border-cti-border bg-cti-sidebar p-5 transition-all duration-300 hover:border-cti-cyan/40 hover:shadow-lg hover:shadow-cyan-950/15"
        >
          <h2 class="font-semibold text-cti-text">
            Clientes por segmento
          </h2>

          <p class="mt-1 text-sm text-cti-muted">
            Participação de cada segmento.
          </p>

          <div class="relative mt-6 h-72">
            <canvas ref="canvasSegmentos"></canvas>
          </div>
        </article>
      </div>

      <!-- ===================================== -->
      <!-- QUALIDADE DOS DADOS + MAPA -->
      <!-- ===================================== -->

      <!-- TESTE 1:
           items-start evita que o card do mapa
           tenha a mesma altura do card de qualidade.
      -->
      <div
        class="grid grid-cols-1 items-start gap-5 xl:grid-cols-2"
      >
        <!-- QUALIDADE DOS DADOS -->
        <article
          class="dashboard-card flex min-w-0 flex-col rounded-2xl border border-cti-border bg-cti-sidebar p-5 transition-all duration-300 hover:border-cti-cyan/40 hover:shadow-lg hover:shadow-cyan-950/15"
        >
          <h2 class="font-semibold text-cti-text">
            Qualidade dos dados
          </h2>

          <p class="mt-1 text-sm text-cti-muted">
            Registros válidos e inválidos.
          </p>

          <div class="relative mt-5 h-56 shrink-0 sm:h-64">
            <canvas ref="canvasValidacao"></canvas>
          </div>

          <!-- TAXA DE APROVAÇÃO -->
          <div
            class="mt-4 rounded-xl border border-cti-border bg-cti-card p-4 text-center transition-all duration-300 hover:border-cti-cyan/30"
          >
            <p class="text-3xl font-bold text-cti-cyan">
              {{ percentualValido }}%
            </p>

            <p class="mt-1 text-xs text-cti-muted">
              Taxa de aprovação da planilha
            </p>
          </div>

          <!-- STATUS DA QUALIDADE -->
          <div
            class="mt-4 rounded-xl border border-cti-border bg-cti-card p-4"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                :style="{
                  color: statusQualidade.cor,
                  backgroundColor: statusQualidade.cor + '15'
                }"
              >
                <i
                  :class="[
                    'fa-solid',
                    statusQualidade.icone
                  ]"
                  aria-hidden="true"
                ></i>
              </div>

              <div class="min-w-0">
                <p class="text-xs text-cti-muted">
                  Status da qualidade da planilha
                </p>

                <p
                  class="mt-1 text-lg font-bold"
                  :style="{ color: statusQualidade.cor }"
                >
                  {{ statusQualidade.titulo }}
                </p>

                <p class="mt-1 text-xs leading-5 text-cti-muted">
                  {{ statusQualidade.descricao }}
                </p>
              </div>
            </div>

            <div
              class="mt-4 h-2 overflow-hidden rounded-full bg-cti-sidebar"
            >
              <div
                class="h-full rounded-full transition-all duration-700"
                :style="{
                  width: Math.max(
                    0,
                    Math.min(100, Number(percentualValido) || 0)
                  ) + '%',
                  backgroundColor: statusQualidade.cor
                }"
              ></div>
            </div>

            <p class="mt-2 text-xs text-cti-muted">
              Classificação baseada na taxa de aprovação.
            </p>
          </div>

          <!-- ===================================== -->
          <!-- DIAGNÓSTICO DA IMPORTAÇÃO -->
          <!-- ===================================== -->
          <div
            class="mt-4 flex-1 rounded-xl border border-cti-border bg-cti-card p-4"
          >
            <div class="flex items-center gap-2">
              <i
                class="fa-solid fa-clipboard-check text-cti-cyan"
                aria-hidden="true"
              ></i>

              <h3 class="text-sm font-semibold text-cti-text">
                Diagnóstico da importação
              </h3>
            </div>

            <p class="mt-1 text-xs leading-5 text-cti-muted">
              Resultado da validação dos registros da planilha.
            </p>

            <div class="mt-4 grid grid-cols-2 gap-3">
              <div
                class="rounded-xl border border-cti-border bg-cti-sidebar p-3 transition-colors hover:border-emerald-400/40"
              >
                <div class="flex items-center gap-2">
                  <i
                    class="fa-solid fa-circle-check text-emerald-400"
                    aria-hidden="true"
                  ></i>

                  <span class="text-xs text-cti-muted">
                    Válidos
                  </span>
                </div>

                <p class="mt-2 text-2xl font-bold text-emerald-400">
                  {{ formatarNumero(totalValidos) }}
                </p>
              </div>

              <div
                class="rounded-xl border border-cti-border bg-cti-sidebar p-3 transition-colors hover:border-orange-400/40"
              >
                <div class="flex items-center gap-2">
                  <i
                    class="fa-solid fa-triangle-exclamation text-orange-400"
                    aria-hidden="true"
                  ></i>

                  <span class="text-xs text-cti-muted">
                    Inválidos
                  </span>
                </div>

                <p class="mt-2 text-2xl font-bold text-orange-400">
                  {{ formatarNumero(totalInvalidos) }}
                </p>
              </div>
            </div>

            <RouterLink
              to="/app/relatorios"
              class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cti-cyan transition-colors hover:text-cyan-300 hover:underline"
            >
              Consultar relatório completo

              <i
                class="fa-solid fa-arrow-right"
                aria-hidden="true"
              ></i>
            </RouterLink>
          </div>
        </article>

        <!-- ===================================== -->
        <!-- CARD EXCLUSIVO DO MAPA DO BRASIL -->
        <!-- ===================================== -->
        <article
          class="dashboard-card flex min-w-0 flex-col rounded-2xl border border-cti-border bg-cti-sidebar p-5 transition-all duration-300 hover:border-cti-cyan/40 hover:shadow-lg hover:shadow-cyan-950/15"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold text-cti-text">
                Distribuição por UF
              </h2>

              <p class="mt-1 text-sm text-cti-muted">
                Clientes distribuídos pelos estados brasileiros.
              </p>
            </div>

            <i
              class="fa-solid fa-map-location-dot text-cti-cyan"
              aria-hidden="true"
            ></i>
          </div>

          <!-- Mapa com dimensões e posição aprovadas. -->
          <div
            class="mt-4 flex min-w-0 items-center justify-center"
          >
            <div
              v-if="mapaDisponivel"
              ref="elementoMapa"
              class="h-[340px] w-full sm:h-[380px] xl:h-[400px]"
              role="img"
              aria-label="Mapa interativo do Brasil com a distribuição de clientes por estado"
            ></div>

            <div
              v-else
              class="w-full rounded-xl border border-dashed border-cti-border p-5 text-sm text-cti-muted"
            >
              Não foi possível carregar o mapa geográfico.
              Verifique o arquivo brazil-states.geojson.
            </div>
          </div>

          <!-- Escala nativa e marcador sincronizado com o hover dos estados. -->
          <div v-if="mapaDisponivel" class="relative mt-5 h-[48px] w-full">
            <div
              ref="elementoLegendaMapa"
              class="h-full w-full"
              role="img"
              aria-label="Escala de cores que acompanha o estado apontado no mapa"
            ></div>
            <div
              v-if="ufEmDestaque"
              class="pointer-events-none absolute left-1/2 top-1/2 z-10 h-0 w-[90px] -translate-x-1/2"
              aria-hidden="true"
            >
              <div
                class="absolute -top-[19px] flex -translate-x-1/2 flex-col items-center"
                :style="{ left: posicaoLegendaUF + '%' }"
              >
                <span class="mb-1 rounded bg-cti-card px-1.5 py-0.5 text-[10px] font-semibold leading-none text-cti-text shadow-sm">
                  {{ formatarNumero(ufEmDestaque.total) }}
                </span>
                <span class="h-2.5 w-2.5 rounded-full border-2 border-cti-sidebar bg-white shadow-sm"></span>
              </div>
            </div>
          </div>

          <div
            class="mt-4 border-t border-cti-border pt-4 text-center"
          >
            <p class="text-xs leading-5 text-cti-muted">
              <i
                class="fa-solid fa-computer-mouse mr-1 text-cti-cyan"
                aria-hidden="true"
              ></i>
              Passe o mouse sobre os estados para consultar a
              quantidade de clientes.
            </p>

            <p class="mt-2 text-xs text-cti-muted">
              Estados sem registros aparecem com 0 clientes.
            </p>
          </div>
        </article>
      </div>

      <!-- ===================================== -->
      <!-- INDICADORES GEOGRÁFICOS INDEPENDENTES -->
      <!-- ===================================== -->
      <section
        aria-labelledby="indicadores-geograficos"
        class="space-y-3"
      >
        <div class="flex items-center gap-2">
          <i
            class="fa-solid fa-chart-simple text-cti-cyan"
            aria-hidden="true"
          ></i>

          <h2
            id="indicadores-geograficos"
            class="text-sm font-semibold text-cti-text"
          >
            Indicadores geográficos
          </h2>
        </div>

        <div
          class="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <!-- UFs IDENTIFICADAS -->
          <article
            class="dashboard-card mapa-indicador flex min-w-0 items-center gap-4 rounded-2xl border border-cti-border bg-cti-sidebar p-4 transition-all duration-300"
            style="--mapa-cor: #22D3EE"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400"
            >
              <i
                class="fa-solid fa-location-dot text-lg"
                aria-hidden="true"
              ></i>
            </div>

            <div class="min-w-0">
              <p class="text-xs font-medium text-cti-muted">
                UFs identificadas
              </p>

              <div class="mt-1 flex items-baseline gap-1">
                <p class="text-2xl font-bold text-cti-text">
                  {{ totalEstados }}
                </p>

                <span class="text-xs text-cti-muted">
                  / 27
                </span>
              </div>

              <p class="mt-1 text-xs text-cti-muted">
                Estados com clientes
              </p>
            </div>
          </article>

          <!-- SEGMENTOS -->
          <article
            class="dashboard-card mapa-indicador flex min-w-0 items-center gap-4 rounded-2xl border border-cti-border bg-cti-sidebar p-4 transition-all duration-300"
            style="--mapa-cor: #60A5FA"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400"
            >
              <i
                class="fa-solid fa-layer-group text-lg"
                aria-hidden="true"
              ></i>
            </div>

            <div class="min-w-0">
              <p class="text-xs font-medium text-cti-muted">
                Segmentos
              </p>

              <p class="mt-1 text-2xl font-bold text-cti-text">
                {{ totalSegmentos }}
              </p>

              <p class="mt-1 text-xs text-cti-muted">
                Segmentos identificados
              </p>
            </div>
          </article>

          <!-- UF COM MAIS CLIENTES -->
          <article
            class="dashboard-card mapa-indicador flex min-w-0 items-center gap-4 rounded-2xl border border-cti-border bg-cti-sidebar p-4 transition-all duration-300"
            style="--mapa-cor: #34D399"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400"
            >
              <i
                class="fa-solid fa-trophy text-lg"
                aria-hidden="true"
              ></i>
            </div>

            <div class="min-w-0">
              <p class="text-xs font-medium text-cti-muted">
                UF com mais clientes
              </p>

              <p class="mt-1 break-words text-sm font-bold text-cti-text">
                {{ ufLider?.nome || "Não disponível" }}
              </p>

              <p class="mt-1 text-xl font-bold text-emerald-400">
                {{ formatarNumero(ufLider?.total || 0) }}
                <span
                  class="text-xs font-normal text-cti-muted"
                >
                  clientes
                </span>
              </p>
            </div>
          </article>
        </div>

        <p
          v-if="ufLider"
          class="text-xs leading-5 text-cti-muted"
        >
          <i
            class="fa-solid fa-circle-info mr-1 text-cti-cyan"
            aria-hidden="true"
          ></i>

          {{ ufLider.nome }} representa
          {{ percentualUFLider }}% dos clientes com UF reconhecida.
        </p>
      </section>

      <!-- ===================================== -->
      <!-- RESUMO EXECUTIVO -->
      <!-- ===================================== -->
      <article
        class="dashboard-card rounded-2xl border border-cti-border bg-cti-sidebar p-5 transition-all duration-300 hover:border-cti-cyan/40 hover:shadow-lg hover:shadow-cyan-950/15"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cti-cyan/10 text-cti-cyan"
          >
            <i
              class="fa-solid fa-clipboard-list"
              aria-hidden="true"
            ></i>
          </div>

          <div>
            <h2 class="font-semibold text-cti-text">
              Resumo executivo
            </h2>

            <p class="mt-1 text-sm text-cti-muted">
              Principais informações identificadas na planilha atual.
            </p>
          </div>
        </div>

        <div
          class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <div
            v-for="item in resumoExecutivo"
            :key="item.titulo"
            class="resumo-item flex items-start gap-3 rounded-xl border border-cti-border bg-cti-card p-4 transition-all duration-300"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              :style="{
                color: item.cor,
                backgroundColor: item.cor + '15'
              }"
            >
              <i
                :class="['fa-solid', item.icone]"
                aria-hidden="true"
              ></i>
            </div>

            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-cti-text">
                {{ item.titulo }}
              </h3>

              <p class="mt-1 break-words text-sm leading-6 text-cti-muted">
                {{ item.descricao }}
              </p>
            </div>
          </div>
        </div>
      </article>

      <!-- ===================================== -->
      <!-- AÇÕES RÁPIDAS -->
      <!-- ===================================== -->
      <article
        class="dashboard-card rounded-2xl border border-cti-border bg-cti-sidebar p-5 transition-all duration-300 hover:border-cti-cyan/40 hover:shadow-lg hover:shadow-cyan-950/15"
      >
        <h2 class="font-semibold text-cti-text">
          Ações rápidas
        </h2>

        <p class="mt-1 text-sm text-cti-muted">
          Acesse rapidamente as principais funcionalidades.
        </p>

        <div
          class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <RouterLink
            v-for="acao in acoesRapidas"
            :key="acao.titulo"
            :to="acao.rota"
            class="acao-rapida group flex min-w-0 items-center gap-3 rounded-xl border border-cti-border bg-cti-card p-4 transition-all duration-300 hover:-translate-y-0.5 motion-reduce:transform-none"
            :style="{ '--acao-cor': acao.cor }"
          >
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              :style="{
                color: acao.cor,
                backgroundColor: acao.cor + '15'
              }"
            >
              <i
                :class="['fa-solid', acao.icone]"
                aria-hidden="true"
              ></i>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-cti-text">
                {{ acao.titulo }}
              </p>

              <p class="mt-1 text-xs text-cti-muted">
                {{ acao.descricao }}
              </p>
            </div>

            <i
              class="fa-solid fa-arrow-right text-xs text-cti-muted transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            ></i>
          </RouterLink>
        </div>
      </article>

      <!-- ===================================== -->
      <!-- RESUMO DOS CLIENTES -->
      <!-- ===================================== -->
      <article
        class="dashboard-card min-w-0 overflow-hidden rounded-2xl border border-cti-border bg-cti-sidebar transition-all duration-300 hover:border-cti-cyan/40 hover:shadow-lg hover:shadow-cyan-950/15"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-b border-cti-border p-5"
        >
          <div>
            <h2 class="font-semibold text-cti-text">
              Resumo dos clientes
            </h2>

            <p class="mt-1 text-sm text-cti-muted">
              Primeiros registros da planilha atual.
            </p>
          </div>

          <RouterLink
            to="/app/clientes"
            class="inline-flex items-center gap-2 text-sm font-semibold text-cti-cyan transition-colors duration-200 hover:text-cyan-300 hover:underline"
          >
            Ver todos

            <i
              class="fa-solid fa-arrow-right"
              aria-hidden="true"
            ></i>
          </RouterLink>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[650px] text-left text-sm">
            <thead
              class="border-b border-cti-border bg-cti-card/40"
            >
              <tr class="text-cti-muted">
                <th class="px-5 py-4 font-medium">
                  Código
                </th>
                <th class="px-5 py-4 font-medium">
                  Cliente
                </th>
                <th class="px-5 py-4 font-medium">
                  Segmento
                </th>
                <th class="px-5 py-4 font-medium">
                  Nível
                </th>
                <th class="px-5 py-4 font-medium">
                  UF
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(cliente, indice) in clientesResumo"
                :key="indice"
                class="border-b border-cti-border/70 transition-colors duration-200 hover:bg-cti-cyan/5 last:border-0"
              >
                <td class="px-5 py-4 text-cti-muted">
                  {{ texto(cliente.codigo_cliente) }}
                </td>

                <td class="px-5 py-4 font-medium text-cti-text">
                  {{ texto(cliente.nome_cliente) }}
                </td>

                <td class="px-5 py-4 text-cti-muted">
                  {{ texto(cliente.segmento) }}
                </td>

                <td class="px-5 py-4 text-cti-cyan">
                  {{ texto(cliente.nivel_cliente) }}
                </td>

                <td class="px-5 py-4 text-cti-muted">
                  {{ texto(cliente.uf) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- ===================================== -->
      <!-- PRINCIPAIS INCONSISTÊNCIAS -->
      <!-- ===================================== -->
      <article
        v-if="errosResumo.length"
        class="dashboard-card rounded-2xl border border-cti-border bg-cti-sidebar p-5 transition-all duration-300 hover:border-cti-cyan/40 hover:shadow-lg hover:shadow-cyan-950/15"
      >
        <h2 class="font-semibold text-cti-text">
          Principais inconsistências
        </h2>

        <p class="mt-1 text-sm text-cti-muted">
          Resumo dos tipos de erro identificados.
        </p>

        <div class="mt-5 space-y-3">
          <div
            v-for="erro in errosResumo"
            :key="erro.nome"
            class="flex items-center justify-between gap-3 rounded-xl bg-cti-card p-3 transition-all duration-200 hover:bg-cti-cyan/10"
          >
            <span class="min-w-0 break-words text-sm text-cti-text">
              {{ erro.nome }}
            </span>

            <span class="shrink-0 font-semibold text-orange-400">
              {{ formatarNumero(erro.total) }}
            </span>
          </div>
        </div>
      </article>
    </template>
  </section>
</template>

<style scoped>

@keyframes dashboard-entrada {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-card {
  animation: dashboard-entrada 450ms ease-out both;
}

/* Hover dos indicadores principais */
.indicador-card:hover {
  border-color: var(--indicador-cor);
  box-shadow: 0 8px 22px -16px var(--indicador-cor);
}

/* Cards geográficos independentes */
.mapa-indicador:hover {
  border-color: var(--mapa-cor);
  box-shadow: 0 8px 22px -16px var(--mapa-cor);
  transform: translateY(-2px);
}

/* Resumo executivo */
.resumo-item:hover {
  border-color: rgba(34, 211, 238, 0.35);
  background-color: rgba(34, 211, 238, 0.04);
}

/* Ações rápidas */
.acao-rapida:hover {
  border-color: var(--acao-cor);
  box-shadow: 0 8px 22px -16px var(--acao-cor);
}

/* Redução de movimento */
@media (prefers-reduced-motion: reduce) {
  .dashboard-card {
    animation: none !important;
    transition: none !important;
  }

  .indicador-card:hover,
  .mapa-indicador:hover,
  .acao-rapida:hover {
    transform: none !important;
  }
}
</style>