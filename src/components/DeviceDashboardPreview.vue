<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  device: { type: String, required: true },
})

const tabs = ['Upload', 'Relatórios', 'Gráficos']
const selectedTab = ref('Relatórios')
const deviceNames = {
  mobile: 'Celular',
  tablet: 'Tablet',
  laptop: 'Notebook',
  desktop: 'Computador',
}
const isMobile = computed(() => props.device === 'mobile')
const isTablet = computed(() => props.device === 'tablet')
const compact = computed(() => isMobile.value || isTablet.value)

const indicators = [
  { label: 'Total de clientes', value: '1.250', icon: 'fa-solid fa-users', color: 'text-[#38BDF8]' },
  { label: 'Registros válidos', value: '1.180', icon: 'fa-solid fa-circle-check', color: 'text-[#00C7A5]' },
  { label: 'Registros inválidos', value: '70', icon: 'fa-solid fa-circle-exclamation', color: 'text-amber-400' },
  { label: 'Taxa de validação', value: '94,4%', icon: 'fa-solid fa-chart-pie', color: 'text-[#38BDF8]' },
]
const tableRows = [
  { name: 'Registro 001', status: 'Válido', ok: true },
  { name: 'Registro 002', status: 'Válido', ok: true },
  { name: 'Registro 003', status: 'Inconsistência', ok: false },
]
</script>

<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0b1220] text-slate-100">
    <div class="flex min-h-0 flex-1">
      <!-- Navegação inspirada no menu real do CTI Insights -->
      <aside
        v-if="!isMobile"
        class="flex shrink-0 flex-col border-r border-[#26364d] bg-[#070e1e] py-3"
        :class="isTablet ? 'w-9 items-center gap-3' : 'w-[23%] min-w-[66px] gap-1 px-2'"
      >
        <div class="mb-3 flex items-center gap-1 text-[#38BDF8]" :class="isTablet ? 'justify-center' : 'px-1'">
          <i class="fa-solid fa-cloud" :class="compact ? 'text-[9px]' : 'text-[12px]'"></i>
          <span v-if="!isTablet" class="truncate text-[9px] font-black tracking-wide">CTI <span class="text-white">INSIGHTS</span></span>
        </div>
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          :aria-label="tab"
          :title="tab"
          @click="selectedTab = tab"
          class="flex w-full items-center rounded-md text-left transition-colors"
          :class="[
            selectedTab === tab ? 'bg-[#38BDF8]/15 text-[#38BDF8]' : 'text-slate-400 hover:bg-white/5',
            isTablet ? 'justify-center py-2' : 'gap-1.5 px-2 py-2'
          ]"
        >
          <i :class="tab === 'Upload' ? 'fa-solid fa-cloud-arrow-up' : tab === 'Relatórios' ? 'fa-solid fa-file-lines' : 'fa-solid fa-chart-column'" class="text-[9px]"></i>
          <span v-if="!isTablet" class="truncate text-[9px]">{{ tab }}</span>
        </button>
      </aside>

      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <header class="flex shrink-0 items-center justify-between gap-2 border-b border-[#26364d] bg-[#101d32] px-3 py-2">
          <div class="min-w-0">
            <p class="truncate font-bold" :class="compact ? 'text-[9px]' : 'text-[11px]'">
              {{ isMobile ? 'CTI INSIGHTS' : selectedTab }}
            </p>
            <p class="truncate text-[8px] text-slate-400">Área de análise de dados</p>
          </div>
          <span class="shrink-0 rounded-full bg-[#00C7A5]/10 px-2 py-1 text-[8px] text-[#00C7A5]">Demo</span>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-[8px] font-medium text-[#38BDF8]">CTI Insights / {{ selectedTab }}</p>
              <h3 class="mt-0.5 font-extrabold" :class="compact ? 'text-[11px]' : 'text-[14px]'">
                {{ selectedTab === 'Upload' ? 'Upload de Planilha' : selectedTab === 'Gráficos' ? 'Gráficos e indicadores' : 'Relatórios' }}
              </h3>
            </div>
            <i class="fa-solid fa-chart-line text-[#38BDF8]" :class="compact ? 'text-xs' : 'text-base'"></i>
          </div>

          <div v-if="selectedTab === 'Upload'" class="mt-3 rounded-lg border border-dashed border-[#26364d] bg-[#17263d] p-3 text-center">
            <i class="fa-solid fa-cloud-arrow-up text-lg text-[#38BDF8]"></i>
            <p class="mt-1 text-[10px] font-semibold">Importar planilha</p>
            <p class="text-[8px] text-slate-400">Excel e CSV</p>
          </div>

          <div class="mt-3 grid gap-2" :class="isMobile ? 'grid-cols-2' : compact ? 'grid-cols-2' : 'grid-cols-4'">
            <div v-for="metric in indicators" :key="metric.label" class="min-w-0 rounded-lg border border-[#26364d] bg-[#17263d] p-2">
              <div class="flex items-center justify-between gap-1">
                <p class="truncate text-[8px] text-slate-400">{{ metric.label }}</p>
                <i :class="[metric.icon, metric.color]" class="text-[9px]"></i>
              </div>
              <p class="mt-1 font-extrabold" :class="[metric.color, compact ? 'text-[13px]' : 'text-[17px]']">{{ metric.value }}</p>
            </div>
          </div>

          <div class="mt-2 rounded-lg border border-[#26364d] bg-[#17263d] p-3">
            <div class="flex items-center justify-between gap-1">
              <p class="text-[9px] font-semibold">Qualidade dos dados</p>
              <span class="text-[8px] text-[#00C7A5]">94,4%</span>
            </div>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
              <div class="h-full w-[94.4%] rounded-full bg-gradient-to-r from-[#38BDF8] to-[#00C7A5]"></div>
            </div>
          </div>

          <div class="mt-2 rounded-lg border border-[#26364d] bg-[#17263d] p-3">
            <p class="text-[9px] font-semibold">{{ selectedTab === 'Gráficos' ? 'Distribuição de resultados' : 'Evolução dos dados' }}</p>
            <svg viewBox="0 0 280 85" class="mt-2 w-full" role="img" aria-label="Gráfico ilustrativo de evolução dos registros">
              <defs>
                <linearGradient :id="`preview-fill-${device}`" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#38BDF8" stop-opacity=".25" />
                  <stop offset="100%" stop-color="#38BDF8" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 20H280 M0 42H280 M0 64H280" stroke="#334155" stroke-width=".5" stroke-dasharray="3 4"/>
              <path d="M0 70 C35 65 48 43 80 50 S130 70 160 38 S215 45 245 27 L280 12 V85 H0Z" :fill="`url(#preview-fill-${device})`" />
              <path d="M0 70 C35 65 48 43 80 50 S130 70 160 38 S215 45 245 27 L280 12" stroke="#38BDF8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            </svg>
          </div>

          <div v-if="!isMobile" class="mt-2 overflow-hidden rounded-lg border border-[#26364d] bg-[#17263d]">
            <p class="border-b border-[#26364d] px-3 py-2 text-[9px] font-semibold">Registros analisados</p>
            <div v-for="row in tableRows" :key="row.name" class="flex justify-between gap-2 border-b border-[#26364d]/60 px-3 py-1.5 text-[8px] last:border-0">
              <span class="text-slate-300">{{ row.name }}</span>
              <span :class="row.ok ? 'text-[#00C7A5]' : 'text-amber-400'">{{ row.status }}</span>
            </div>
          </div>
        </div>
        <nav v-if="isMobile" aria-label="Navegação da demonstração mobile" class="grid shrink-0 grid-cols-3 border-t border-[#26364d] bg-[#101d32]">
          <button v-for="tab in tabs" :key="tab" type="button" @click="selectedTab = tab" class="flex flex-col items-center gap-1 py-2 text-[8px]" :class="selectedTab === tab ? 'text-[#38BDF8]' : 'text-slate-400'">
            <i :class="tab === 'Upload' ? 'fa-solid fa-cloud-arrow-up' : tab === 'Relatórios' ? 'fa-solid fa-file-lines' : 'fa-solid fa-chart-column'"></i>
            {{ tab }}
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>