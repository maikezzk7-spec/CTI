<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Chart from 'chart.js/auto'

const canvasRef = ref(null)
let chartInstance = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const gradiente = ctx.createLinearGradient(0, 0, 0, 230)

  gradiente.addColorStop(0, 'rgba(56, 189, 248, 0.32)')
  gradiente.addColorStop(1, 'rgba(56, 189, 248, 0)')

  chartInstance = new Chart(ctx, {
    type: 'line',

    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],

      datasets: [
        {
          label: 'Registros demonstrativos',
          data: [120, 165, 149, 220, 205, 290],

          borderColor: '#38BDF8',
          backgroundColor: gradiente,

          borderWidth: 3,
          fill: true,
          tension: 0.4,

          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#38BDF8',
          pointBorderColor: '#101D32',
          pointBorderWidth: 2
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      },

      interaction: {
        mode: 'index',
        intersect: false
      },

      plugins: {
        legend: {
          display: false
        },

        tooltip: {
          backgroundColor: '#020617',
          titleColor: '#FFFFFF',
          bodyColor: '#CBD5E1',
          borderColor: 'rgba(56, 189, 248, 0.3)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) =>
              `${context.parsed.y} registros (demonstração)`
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },

          border: {
            display: false
          },

          ticks: {
            color: '#94A3B8',
            font: {
              size: 11
            }
          }
        },

        y: {
          beginAtZero: true,

          border: {
            display: false
          },

          grid: {
            color: 'rgba(148, 163, 184, 0.10)'
          },

          ticks: {
            color: '#94A3B8',
            precision: 0,
            font: {
              size: 11
            }
          }
        }
      }
    }
  })
})

onBeforeUnmount(() => {
  chartInstance?.destroy()
  chartInstance = null
})
</script>

<template>
  <div
    class="rounded-2xl border border-[#38BDF8]/15 bg-slate-950/35 p-4 shadow-lg shadow-black/10 backdrop-blur-md"
  >
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 class="flex items-center gap-2 text-sm font-bold text-white">
          <i class="fa-solid fa-chart-line text-[#38BDF8]"></i>
          Visualização de dados
        </h3>

        <p class="mt-1 text-xs text-slate-400">
          Evolução ilustrativa de registros
        </p>
      </div>

      <span
        class="rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-2.5 py-1 text-[10px] font-semibold text-[#7DD3FC]"
      >
        Demo
      </span>
    </div>

    <div class="relative h-44 w-full">
      <canvas
        ref="canvasRef"
        role="img"
        aria-label="Gráfico demonstrativo de evolução de registros entre janeiro e junho"
      ></canvas>
    </div>

    <p class="mt-3 text-center text-[11px] text-slate-500">
      Dados ilustrativos — não representam registros reais.
    </p>
  </div>
</template>