<template>
  <nav
    v-if="totalItens > 0"
    class="flex flex-col gap-4 border-t border-cti-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    aria-label="Paginação da tabela"
  >
    <!-- Quantidade de registros -->
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm text-cti-muted">
        Registros por página:
      </span>

      <div class="w-28 shrink-0">
        <FiltroSelect
          :id="idSeletor"
          :model-value="tamanhoPagina"
          :opcoes="opcoesFormatadas"
          placeholder="Selecionar"
          icone="fa-solid fa-list-ol"
          :incluir-todos="false"
          direcao="direita"
          @update:model-value="alterarTamanho"
        />
      </div>

      <span class="text-sm text-cti-muted">
        Exibindo {{ primeiroItem }}–{{ ultimoItem }}
        de {{ totalItens }}
      </span>
    </div>

    <!-- Navegação -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        :disabled="paginaAtual <= 1"
        class="rounded-lg border border-cti-border bg-cti-card px-3 py-2 text-sm text-cti-text transition hover:border-cti-cyan hover:text-cti-cyan disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
        @click="alterarPagina(paginaAtual - 1)"
      >
        <i
          class="fa-solid fa-chevron-left"
          aria-hidden="true"
        ></i>
      </button>

      <template
        v-for="(item, indice) in paginasVisiveis"
        :key="`${item}-${indice}`"
      >
        <span
          v-if="item === '...'"
          class="px-1 text-sm text-cti-muted"
          aria-hidden="true"
        >
          ...
        </span>

        <button
          v-else
          type="button"
          :aria-label="`Ir para página ${item}`"
          :aria-current="
            item === paginaAtual ? 'page' : undefined
          "
          :class="[
            'min-w-10 rounded-lg border px-3 py-2 text-sm font-medium transition',
            item === paginaAtual
              ? 'border-cti-cyan bg-cti-cyan text-slate-950'
              : 'border-cti-border bg-cti-card text-cti-text hover:border-cti-cyan hover:text-cti-cyan'
          ]"
          @click="alterarPagina(item)"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        :disabled="paginaAtual >= totalPaginas"
        class="rounded-lg border border-cti-border bg-cti-card px-3 py-2 text-sm text-cti-text transition hover:border-cti-cyan hover:text-cti-cyan disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Próxima página"
        @click="alterarPagina(paginaAtual + 1)"
      >
        <i
          class="fa-solid fa-chevron-right"
          aria-hidden="true"
        ></i>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed, useId } from "vue";
import FiltroSelect from "./FiltroSelect.vue";

const props = defineProps({
  totalItens: {
    type: Number,
    required: true,
    validator: (valor) =>
      Number.isInteger(valor) && valor >= 0
  },

  paginaAtual: {
    type: Number,
    required: true
  },

  tamanhoPagina: {
    type: Number,
    default: 50
  },

  opcoesTamanho: {
    type: Array,
    default: () => [10, 25, 50]
  }
});

const emit = defineEmits([
  "update:paginaAtual",
  "update:tamanhoPagina"
]);

const idSeletor = useId();

const opcoesFormatadas = computed(() =>
  props.opcoesTamanho.map((quantidade) => ({
    valor: quantidade,
    label: String(quantidade)
  }))
);

const totalPaginas = computed(() =>
  Math.max(
    1,
    Math.ceil(props.totalItens / props.tamanhoPagina)
  )
);

const paginaSegura = computed(() =>
  Math.min(
    Math.max(1, props.paginaAtual),
    totalPaginas.value
  )
);

const primeiroItem = computed(() => {
  if (props.totalItens === 0) return 0;

  return (
    (paginaSegura.value - 1) * props.tamanhoPagina + 1
  );
});

const ultimoItem = computed(() =>
  Math.min(
    paginaSegura.value * props.tamanhoPagina,
    props.totalItens
  )
);

const paginasVisiveis = computed(() => {
  const total = totalPaginas.value;
  const atual = paginaSegura.value;

  if (total <= 7) {
    return Array.from(
      { length: total },
      (_, indice) => indice + 1
    );
  }

  const paginas = new Set([
    1,
    total,
    atual - 1,
    atual,
    atual + 1
  ]);

  const ordenadas = [...paginas]
    .filter((pagina) => pagina >= 1 && pagina <= total)
    .sort((a, b) => a - b);

  const resultado = [];

  for (let indice = 0; indice < ordenadas.length; indice++) {
    const pagina = ordenadas[indice];

    if (indice > 0) {
      const anterior = ordenadas[indice - 1];
      const diferenca = pagina - anterior;

      if (diferenca === 2) {
        resultado.push(anterior + 1);
      } else if (diferenca > 2) {
        resultado.push("...");
      }
    }

    resultado.push(pagina);
  }

  return resultado;
});

function alterarPagina(novaPagina) {
  if (
    !Number.isInteger(novaPagina) ||
    novaPagina < 1 ||
    novaPagina > totalPaginas.value ||
    novaPagina === props.paginaAtual
  ) {
    return;
  }

  emit("update:paginaAtual", novaPagina);
}

function alterarTamanho(novoValor) {
  const novoTamanho = Number(novoValor);

  if (
    !props.opcoesTamanho.includes(novoTamanho) ||
    novoTamanho === props.tamanhoPagina
  ) {
    return;
  }

  emit("update:tamanhoPagina", novoTamanho);
  emit("update:paginaAtual", 1);
}
</script>