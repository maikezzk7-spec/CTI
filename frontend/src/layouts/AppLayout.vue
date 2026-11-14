<template>
  <div class="min-h-screen bg-cti-bg text-cti-text">
    <!-- Sidebar -->
    <Sidebar
      :menu-aberto="menuMobileAberto"
      @fechar-menu="menuMobileAberto = false"
    />

    <!-- Área principal -->
    <div
      class="min-h-screen min-w-0 transition-all duration-300 lg:ml-60"
    >
      <!-- Header -->
      <Header
        @abrir-menu="menuMobileAberto = true"
      />

      <!-- Conteúdo -->
      <main
        class="mx-auto w-full max-w-[1600px] min-w-0
               px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'

const menuMobileAberto = ref(false)
</script>