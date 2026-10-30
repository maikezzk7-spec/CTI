<template>
  <div class="min-h-screen bg-cti-bg p-4 text-cti-text sm:p-6 lg:p-8">
    <!-- Cabeçalho da página -->
    <header class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div class="mb-2 flex items-center gap-2 text-sm text-cti-muted">
          <i class="fa-solid fa-chart-column text-cti-cyan" aria-hidden="true"></i>
          <span>Relatórios</span>
        </div>

        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
          Relatórios
        </h1>

        <p class="mt-2 max-w-2xl text-sm leading-6 text-cti-muted sm:text-base">
          Acompanhe os resultados da validação e identifique inconsistências
          nos dados da sua planilha.
        </p>
      </div>

      <div
        v-if="store.temDados"
        class="flex items-center gap-2 rounded-full border border-cti-border bg-cti-card px-3 py-2 text-sm text-cti-muted"
      >
        <span class="h-2 w-2 rounded-full bg-cti-turquoise"></span>
        Relatório disponível
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
        <i class="fa-solid fa-file-circle-question text-3xl" aria-hidden="true"></i>
      </div>

      <h2 class="text-lg font-semibold text-cti-text">
        Nenhuma planilha processada
      </h2>

      <p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-cti-muted">
        Acesse a tela de Upload, selecione uma planilha e execute a validação
        para visualizar os indicadores, os erros encontrados e os detalhes
        dos registros.
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
      <!-- Informações do arquivo -->
      <section
        class="mb-6 flex flex-col gap-4 rounded-2xl border border-cti-border bg-cti-sidebar p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div class="flex min-w-0 items-start gap-4">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cti-card text-cti-cyan"
          >
            <i class="fa-solid fa-file-excel text-xl" aria-hidden="true"></i>
          </div>

          <div class="min-w-0">
            <p class="text-sm text-cti-muted">Arquivo analisado</p>
            <h2 class="mt-1 break-words text-base font-semibold sm:text-lg">
              {{ store.nomeArquivo }}
            </h2>
            <p class="mt-1 text-xs text-cti-muted">
              {{ store.totalClientes }} registros encontrados
            </p>
          </div>
        </div>

        <span
          class="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-cti-border bg-cti-card px-3 py-2 text-xs font-medium text-cti-cyan sm:text-sm"
        >
          <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
          {{ store.statusValidacao }}
        </span>
      </section>

      <!-- Indicadores principais -->
      <section
        class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Indicadores da validação"
      >
        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors duration-200 hover:border-cti-cyan/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Total de clientes</p>
              <p class="mt-3 text-3xl font-bold tracking-tight">
                {{ store.totalClientes }}
              </p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-cti-cyan/10 text-cti-cyan">
              <i class="fa-solid fa-users text-lg" aria-hidden="true"></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Registros identificados na planilha
          </p>
        </article>

        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors duration-200 hover:border-green-400/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Clientes válidos</p>
              <p class="mt-3 text-3xl font-bold tracking-tight text-green-400">
                {{ store.totalValidados }}
              </p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
              <i class="fa-solid fa-circle-check text-lg" aria-hidden="true"></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Registros sem inconsistências
          </p>
        </article>

        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors duration-200 hover:border-red-400/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Clientes inválidos</p>
              <p class="mt-3 text-3xl font-bold tracking-tight text-red-400">
                {{ store.totalInvalidados }}
              </p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
              <i class="fa-solid fa-triangle-exclamation text-lg" aria-hidden="true"></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Registros que precisam de correção
          </p>
        </article>

        <article
          class="rounded-2xl border border-cti-border bg-cti-card p-5 transition-colors duration-200 hover:border-amber-400/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-cti-muted">Total de erros</p>
              <p class="mt-3 text-3xl font-bold tracking-tight text-amber-400">
                {{ store.totalErros }}
              </p>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <i class="fa-solid fa-bug text-lg" aria-hidden="true"></i>
            </div>
          </div>

          <p class="mt-4 text-xs text-cti-muted">
            Inconsistências identificadas
          </p>
        </article>
      </section>

      <!-- Percentual de validação -->
      <section
        class="mb-8 rounded-2xl border border-cti-border bg-cti-sidebar p-5 sm:p-6"
      >
        <div class="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold">Resultado da validação</h2>
            <p class="mt-1 text-sm text-cti-muted">
              Proporção de registros aprovados na análise.
            </p>
          </div>

          <span
            class="rounded-xl bg-cti-cyan/10 px-3 py-2 text-xl font-bold text-cti-cyan"
          >
            {{ store.percentualValido }}%
          </span>
        </div>

        <div
          class="h-3 overflow-hidden rounded-full bg-cti-border"
          role="progressbar"
          :aria-valuenow="store.percentualValido"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Percentual de registros válidos"
        >
          <div
            class="h-full rounded-full bg-gradient-to-r from-cti-cyan to-cti-turquoise transition-all duration-500"
            :style="{ width: `${store.percentualValido}%` }"
          ></div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span class="text-cti-muted">
            {{ store.totalValidados }} de {{ store.totalClientes }} clientes válidos
          </span>

          <span class="font-medium text-cti-text">
            {{ store.totalInvalidados }} precisam de revisão
          </span>
        </div>
      </section>

      <!-- Tipos de erros -->
      <section
        class="mb-8 rounded-2xl border border-cti-border bg-cti-sidebar p-5 sm:p-6"
      >
        <div class="mb-5">
          <h2 class="text-lg font-semibold">Tipos de erros encontrados</h2>
          <p class="mt-1 text-sm text-cti-muted">
            Quantidade de ocorrências agrupadas por categoria.
          </p>
        </div>

        <div
          v-if="!store.totalErros"
          class="rounded-xl border border-green-400/20 bg-green-400/5 p-5 text-sm text-green-400"
        >
          <i class="fa-solid fa-circle-check mr-2" aria-hidden="true"></i>
          Nenhum erro foi encontrado na validação.
        </div>

        <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="(quantidade, tipo) in store.tiposErros"
            :key="tipo"
            class="flex items-center justify-between gap-4 rounded-xl border border-cti-border bg-cti-card p-4 transition-colors hover:border-cti-cyan/40"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
              </div>

              <span class="break-words text-sm text-cti-text">
                {{ tipo }}
              </span>
            </div>

            <span class="shrink-0 rounded-lg bg-cti-sidebar px-3 py-1.5 text-sm font-bold text-amber-400">
              {{ quantidade }}
            </span>
          </article>
        </div>
      </section>

      <!-- Detalhamento dos erros -->
      <section
        class="mb-8 rounded-2xl border border-cti-border bg-cti-sidebar p-5 sm:p-6"
      >
        <div class="mb-5">
          <h2 class="text-lg font-semibold">Detalhamento dos erros</h2>
          <p class="mt-1 text-sm text-cti-muted">
            Consulte a linha, o campo e a descrição de cada inconsistência.
          </p>
        </div>

        <div
          v-if="!store.detalhesErros.length"
          class="rounded-xl border border-green-400/20 bg-green-400/5 p-5 text-sm text-green-400"
        >
          <i class="fa-solid fa-circle-check mr-2" aria-hidden="true"></i>
          Não existem erros para exibir.
        </div>

        <div v-else class="overflow-x-auto rounded-xl border border-cti-border">
          <table class="w-full min-w-[650px] border-collapse text-left text-sm">
            <thead class="bg-cti-card text-xs uppercase tracking-wider text-cti-muted">
              <tr>
                <th scope="col" class="px-4 py-4 font-semibold">Linha</th>
                <th scope="col" class="px-4 py-4 font-semibold">Campo</th>
                <th scope="col" class="px-4 py-4 font-semibold">Tipo de erro</th>
                <th scope="col" class="px-4 py-4 font-semibold">Descrição</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-cti-border">
              <tr
                v-for="(erro, indice) in store.detalhesErros"
                :key="`${erro.linha}-${erro.campo}-${indice}`"
                class="transition-colors hover:bg-cti-card/70"
              >
                <td class="whitespace-nowrap px-4 py-4 text-cti-muted">
                  {{ erro.linha }}
                </td>

                <td class="px-4 py-4 font-medium text-cti-text">
                  {{ erro.campo }}
                </td>

                <td class="px-4 py-4">
                  <span class="inline-flex rounded-lg bg-red-400/10 px-2.5 py-1 text-xs font-medium text-red-400">
                    {{ erro.tipo }}
                  </span>
                </td>

                <td class="min-w-64 px-4 py-4 leading-6 text-cti-muted">
                  {{ erro.descricao }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Clientes invalidados -->
      <section
        class="rounded-2xl border border-cti-border bg-cti-sidebar p-5 sm:p-6"
      >
        <div class="mb-5">
          <h2 class="text-lg font-semibold">Clientes invalidados</h2>
          <p class="mt-1 text-sm text-cti-muted">
            Registros que precisam de atenção antes de serem utilizados.
          </p>
        </div>

        <div
          v-if="!store.dadosInvalidados.length"
          class="rounded-xl border border-green-400/20 bg-green-400/5 p-5 text-sm text-green-400"
        >
          <i class="fa-solid fa-circle-check mr-2" aria-hidden="true"></i>
          Todos os clientes foram validados.
        </div>

        <div v-else class="overflow-x-auto rounded-xl border border-cti-border">
          <table class="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead class="bg-cti-card text-xs uppercase tracking-wider text-cti-muted">
              <tr>
                <th scope="col" class="px-4 py-4 font-semibold">Código</th>
                <th scope="col" class="px-4 py-4 font-semibold">Nome do cliente</th>
                <th scope="col" class="px-4 py-4 font-semibold">Nível</th>
                <th scope="col" class="px-4 py-4 font-semibold">Erros encontrados</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-cti-border">
              <tr
                v-for="(cliente, indice) in store.dadosInvalidados"
                :key="`${cliente.codigo_cliente}-${indice}`"
                class="transition-colors hover:bg-cti-card/70"
              >
                <td class="whitespace-nowrap px-4 py-4 text-cti-muted">
                  {{ cliente.codigo_cliente || "Não informado" }}
                </td>

                <td class="px-4 py-4 font-medium text-cti-text">
                  {{ cliente.nome_cliente || "Não informado" }}
                </td>

                <td class="px-4 py-4">
                  <span class="inline-flex rounded-lg bg-cti-cyan/10 px-2.5 py-1 text-xs font-semibold text-cti-cyan">
                    {{ cliente.nivel_cliente || "Não informado" }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <ul class="space-y-2">
                    <li
                      v-for="(erro, posicao) in cliente.erros"
                      :key="posicao"
                      class="flex items-start gap-2 leading-5 text-cti-muted"
                    >
                      <i class="fa-solid fa-circle-exclamation mt-1 text-xs text-red-400" aria-hidden="true"></i>
                      <span>{{ erro }}</span>
                    </li>
                  </ul>

                  <p class="mt-3 text-xs text-cti-muted">
                    Linha da planilha: {{ cliente.linhaPlanilha }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { useUploadStore } from "../stores/uploadStore";

const store = useUploadStore();
</script>