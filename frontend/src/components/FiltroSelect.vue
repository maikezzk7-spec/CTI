<template>
  <div
    ref="container"
    class="relative w-full min-w-0"
  >
    <label
      v-if="label"
      :for="id"
      class="mb-2 block text-sm font-medium text-cti-muted"
    >
      {{ label }}
    </label>

    <button
      :id="id"
      ref="botao"
      type="button"
      :aria-label="label || placeholder"
      :aria-expanded="aberto"
      :aria-controls="idLista"
      aria-haspopup="listbox"
      class="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border bg-cti-bg px-3 py-2.5 text-sm text-cti-text transition-colors duration-200 hover:border-cti-cyan/60 focus:outline-none focus:ring-2 focus:ring-cti-cyan/25"
      :class="
        aberto
          ? 'border-cti-cyan'
          : 'border-cti-border'
      "
      @click="alternarMenu"
      @keydown.down.prevent="abrirComTeclado('primeiro')"
      @keydown.up.prevent="abrirComTeclado('ultimo')"
      @keydown.esc="fecharMenu"
    >
      <span class="flex min-w-0 items-center gap-2">
        <i
          v-if="icone"
          :class="icone"
          class="shrink-0 text-cti-cyan"
          aria-hidden="true"
        ></i>

        <span class="truncate">
          {{ opcaoSelecionada?.label || placeholder }}
        </span>
      </span>

      <i
        class="fa-solid fa-chevron-down shrink-0 text-xs text-cti-cyan transition-transform duration-200"
        :class="aberto ? 'rotate-180' : ''"
        aria-hidden="true"
      ></i>
    </button>

    <div
      v-if="aberto"
      :id="idLista"
      ref="lista"
      role="listbox"
      :aria-label="label || placeholder"
      class="menu-sem-scrollbar absolute z-50 max-h-60 min-w-full overflow-y-auto overflow-x-hidden rounded-xl border border-cti-border bg-[#101D32] p-1.5 shadow-xl shadow-black/20"
      :class="
        direcao === 'direita'
          ? 'bottom-0 left-full ml-2 w-max min-w-[112px]'
          : 'left-0 top-full mt-2 w-full'
      "
      @keydown.down.prevent="moverFoco(1)"
      @keydown.up.prevent="moverFoco(-1)"
      @keydown.esc.prevent="fecharMenu"
      @keydown.tab="fecharMenu"
    >
      <button
        v-for="(opcao, indice) in opcoesNormalizadas"
        :key="`${String(opcao.valor)}-${indice}`"
        type="button"
        role="option"
        :aria-selected="opcao.valor === modelValue"
        :data-opcao="indice"
        class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 focus:outline-none focus:bg-cti-cyan/10"
        :class="
          opcao.valor === modelValue
            ? 'bg-cti-cyan/10 font-semibold text-cti-cyan'
            : 'text-cti-text hover:bg-cti-cyan/10 hover:text-cti-cyan'
        "
        @click="selecionar(opcao.valor)"
        @keydown.enter.prevent="selecionar(opcao.valor)"
        @keydown.space.prevent="selecionar(opcao.valor)"
      >
        <span class="min-w-0 break-words">
          {{ opcao.label }}
        </span>

        <i
          v-if="opcao.valor === modelValue"
          class="fa-solid fa-check shrink-0 text-cti-cyan"
          aria-hidden="true"
        ></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId
} from "vue";

const props = defineProps({
  id: {
    type: String,
    default: undefined
  },
  label: {
    type: String,
    default: ""
  },
  modelValue: {
    type: [String, Number],
    default: ""
  },
  opcoes: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: "Selecionar"
  },
  icone: {
    type: String,
    default: ""
  },
  incluirTodos: {
    type: Boolean,
    default: false
  },
  direcao: {
    type: String,
    default: "baixo",
    validator: (valor) =>
      ["baixo", "direita"].includes(valor)
  }
});

const emit = defineEmits(["update:modelValue"]);

const aberto = ref(false);
const container = ref(null);
const botao = ref(null);
const lista = ref(null);
const idLista = useId();

const opcoesNormalizadas = computed(() => {
  const opcoes = props.opcoes.map((opcao) => {
    if (
      typeof opcao === "string" ||
      typeof opcao === "number"
    ) {
      return {
        valor: opcao,
        label: String(opcao)
      };
    }

    return {
      valor: opcao.valor ?? opcao.value ?? "",
      label: String(
        opcao.label ??
        opcao.valor ??
        opcao.value ??
        ""
      )
    };
  });

  if (!props.incluirTodos) {
    return opcoes;
  }

  return [
    {
      valor: "",
      label: props.placeholder
    },
    ...opcoes
  ];
});

const opcaoSelecionada = computed(() =>
  opcoesNormalizadas.value.find(
    (opcao) =>
      String(opcao.valor) === String(props.modelValue)
  )
);

function alternarMenu() {
  aberto.value = !aberto.value;
}

function fecharMenu() {
  aberto.value = false;
}

function selecionar(valor) {
  emit("update:modelValue", valor);
  fecharMenu();
  nextTick(() => botao.value?.focus());
}

function focarOpcao(indice) {
  const opcoes = lista.value?.querySelectorAll(
    '[role="option"]'
  );

  opcoes?.[indice]?.focus();
}

async function abrirComTeclado(posicao) {
  aberto.value = true;
  await nextTick();

  const ultimo = opcoesNormalizadas.value.length - 1;

  focarOpcao(posicao === "ultimo" ? ultimo : 0);
}

function moverFoco(direcao) {
  const opcoes = Array.from(
    lista.value?.querySelectorAll('[role="option"]') ?? []
  );

  if (!opcoes.length) return;

  const atual = opcoes.indexOf(document.activeElement);

  const proximo =
    (atual + direcao + opcoes.length) % opcoes.length;

  opcoes[proximo]?.focus();
}

function fecharAoClicarFora(evento) {
  if (
    container.value &&
    !container.value.contains(evento.target)
  ) {
    fecharMenu();
  }
}

function fecharComEscape(evento) {
  if (evento.key === "Escape" && aberto.value) {
    fecharMenu();
    botao.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", fecharAoClicarFora);
  document.addEventListener("keydown", fecharComEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", fecharAoClicarFora);
  document.removeEventListener("keydown", fecharComEscape);
});
</script>

<style scoped>
.menu-sem-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.menu-sem-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>