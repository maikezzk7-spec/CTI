<template>
  <div class="min-h-screen bg-cti-bg text-cti-text">
    <!-- Menu lateral fixo -->
    <Sidebar />

    <!-- Área principal -->
    <div class="ml-60 min-h-screen min-w-0">
      <!-- Cabeçalho compartilhado -->
      <Header />

      <!-- Conteúdo da página -->
      <main class="min-w-0 p-3 sm:p-5 lg:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
</script>