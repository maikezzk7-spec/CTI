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
        Clientes validados:
        <strong>{{ uploadStore.totalValidados }}</strong>
      </p>

      <p>
        Clientes invalidados:
        <strong>{{ uploadStore.totalInvalidados }}</strong>
      </p>

      <p>
        Percentual válido:
        <strong>{{ uploadStore.percentualValido }}%</strong>
      </p>

      <p>
        Total de erros:
        <strong>{{ uploadStore.totalErros }}</strong>
      </p>

    </div>

    <!-- Clientes invalidados -->

    <div
      v-if="uploadStore.dadosInvalidados.length"
      class="invalidados"
    >

      <h2>Clientes invalidados</h2>

      <div
        v-for="(cliente, index) in uploadStore.dadosInvalidados"
        :key="index"
        class="cliente-invalido"
      >

        <p>
          <strong>Código:</strong>
          {{ cliente.codigo_cliente }}
        </p>

        <p>
          <strong>Nome:</strong>
          {{ cliente.nome_cliente || 'Não informado' }}
        </p>

        <p>
          <strong>Consultor:</strong>
          {{ cliente.consultor || 'Não informado' }}
        </p>

        <p>
          <strong>Segmento:</strong>
          {{ cliente.segmento || 'Não informado' }}
        </p>

        <p>
          <strong>Nível:</strong>
          {{ cliente.nivel_cliente || 'Não informado' }}
        </p>

        <p>
          <strong>Erros:</strong>
        </p>

        <ul>
          <li
            v-for="(erro, erroIndex) in cliente.erros"
            :key="erroIndex"
          >
            {{ erro }}
          </li>
        </ul>

      </div>

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