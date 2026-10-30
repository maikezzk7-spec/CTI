<template>
  <aside
    class="fixed left-0 top-0 flex h-screen w-60 flex-col bg-slate-950 p-5 text-white"
  >
    <!-- Logo CTI INSIGHTS -->
    <router-link
      to="/app/upload"
      class="mb-10 flex items-center gap-3"
    >
      <!-- Nuvem com três barras em SVG -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 44"
        fill="none"
        class="h-12 w-16 shrink-0"
        role="img"
        aria-label="Logo CTI Insights"
      >
        <!-- Contorno da nuvem -->
        <path
          d="M18 36H13
             C6.5 36 3 31.5 3 25.5
             C3 19.5 7.5 15 14 14.5
             C15.5 7.5 21 3 28 3
             C34.5 3 39.5 6.5 42 12
             C44 10.5 46 10 48.5 10
             C55.5 10 61 15.5 61 22.5
             C61 29.5 56 36 48 36H18Z"
          stroke="#438DF6"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Três barras centralizadas -->
        <path
          d="M22 28V21
             M32 28V15
             M42 28V16"
          stroke="#E8EDF3"
          stroke-width="4"
          stroke-linecap="round"
        />
      </svg>

      <!-- Nome da marca -->
      <div class="whitespace-nowrap text-lg font-bold">
        CTI
        <span class="text-blue-400">INSIGHTS</span>
      </div>
    </router-link>

    <!-- Navegação -->
    <nav class="flex flex-col gap-2">
      <router-link
        to="/app/upload"
        class="rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
        active-class="bg-slate-800 text-blue-400"
      >
        Upload
      </router-link>

      <router-link
        to="/app/relatorios"
        class="rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
        active-class="bg-slate-800 text-blue-400"
      >
        Relatórios
      </router-link>

      <router-link
        to="/app/graficos"
        class="rounded-lg px-4 py-3 transition-colors hover:bg-slate-800"
        active-class="bg-slate-800 text-blue-400"
      >
        Gráficos
      </router-link>
    </nav>

    <!-- Espaço flexível -->
    <div class="flex-1"></div>

    <!-- Botão Sair -->
    <router-link
      to="/"
      class="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 transition-all duration-300 hover:bg-blue-600 hover:text-white"
    >
      <!-- Ícone Font Awesome -->
      <i
        class="fa-solid fa-door-open text-xl"
        aria-hidden="true"
      ></i>

      <span>Sair</span>
    </router-link>
  </aside>
</template>