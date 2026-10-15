```vue
<template>
  <div class="min-h-screen bg-[#F1F5F9]">
    <!-- Menu lateral fixo -->
    <Sidebar />

    <!-- Área principal, deslocada para a direita -->
    <div class="ml-70 min-h-screen">
      <!-- Cabeçalho -->
      <Header />

      <!-- Conteúdo da página -->
      <main class="min-w-0 p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
</script>
```