<template>
  <div class="upload-page">

    <h1>Upload de Planilha</h1>

    <p>
      Selecione uma planilha Excel ou CSV para carregar os dados.
    </p>

    <input
      type="file"
      accept=".xlsx,.xls,.csv"
      @change="selecionarArquivo"
    />

    <button
      @click="processarPlanilha"
      :disabled="uploadStore.carregando"
    >
      {{ uploadStore.carregando ? 'Processando...' : 'Processar Planilha' }}
    </button>

    <!-- Erros -->
    <div v-if="uploadStore.totalErros" class="erro">
      <p
        v-for="(erro, index) in uploadStore.erros"
        :key="index"
      >
        {{ erro }}
      </p>
    </div>

    <!-- Resumo -->
    <div v-if="uploadStore.temDados" class="resumo">

      <h2>Resumo dos dados</h2>

      <p>
        Total de clientes:
        <strong>{{ uploadStore.totalClientes }}</strong>
      </p>

      <p>
        Clientes nível A:
        <strong>{{ uploadStore.clientesNivelA }}</strong>
      </p>

      <p>
        Total de erros:
        <strong>{{ uploadStore.totalErros }}</strong>
      </p>

    </div>

    <!-- Prévia -->
    <div v-if="uploadStore.temDados">

      <h2>Prévia dos dados</h2>

      <table>

        <thead>
          <tr>
            <th
              v-for="coluna in colunas"
              :key="coluna"
            >
              {{ coluna }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(linha, index) in uploadStore.dadosTratados"
            :key="index"
          >
            <td
              v-for="coluna in colunas"
              :key="coluna"
            >
              {{ linha[coluna] }}
            </td>
          </tr>
        </tbody>

      </table>

    </div>

  </div>
</template>


<script setup>

import { computed } from 'vue'

import { useUploadStore } from '../stores/uploadStore'

const uploadStore = useUploadStore()


function selecionarArquivo(event) {

  const arquivo = event.target.files[0]

  if (arquivo) {
    uploadStore.selecionarArquivo(arquivo)
  }

}


async function processarPlanilha() {

  await uploadStore.processarPlanilha()

}


const colunas = computed(() => {

  if (!uploadStore.dadosTratados.length) {
    return []
  }

  return Object.keys(uploadStore.dadosTratados[0])

})

</script>