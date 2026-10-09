```vue
<template>
  <div class="relatorios">
    <header class="cabecalho">
      <div>
        <h1>Relatórios</h1>
        <p>Acompanhe os resultados da validação da planilha.</p>
      </div>
    </header>

    <!-- Estado inicial -->
    <section v-if="!store.temDados" class="estado-vazio">
      <h2>Nenhuma planilha processada</h2>
      <p>
        Acesse a tela de upload, selecione uma planilha e execute a validação
        para visualizar os relatórios.
      </p>
    </section>

    <template v-else>
      <!-- Informações do arquivo -->
      <section class="arquivo">
        <div>
          <span class="rotulo">Arquivo analisado</span>
          <h2>{{ store.nomeArquivo }}</h2>
        </div>

        <span class="status">{{ store.statusValidacao }}</span>
      </section>

      <!-- Indicadores -->
      <section class="indicadores">
        <article class="card">
          <span>Total de clientes</span>
          <strong>{{ store.totalClientes }}</strong>
        </article>

        <article class="card valido">
          <span>Clientes validados</span>
          <strong>{{ store.totalValidados }}</strong>
        </article>

        <article class="card invalido">
          <span>Clientes invalidados</span>
          <strong>{{ store.totalInvalidados }}</strong>
        </article>

        <article class="card">
          <span>Total de erros</span>
          <strong>{{ store.totalErros }}</strong>
        </article>
      </section>

      <!-- Percentual de validação -->
      <section class="secao">
        <h2>Percentual de validação</h2>

        <div class="progresso-info">
          <span>Registros válidos</span>
          <strong>{{ store.percentualValido }}%</strong>
        </div>

        <div class="barra">
          <div
            class="barra-preenchida"
            :style="{ width: `${store.percentualValido}%` }"
          ></div>
        </div>

        <p class="descricao">
          {{ store.totalValidados }} de {{ store.totalClientes }}
          clientes foram validados com sucesso.
        </p>
      </section>

      <!-- Tipos de erros -->
      <section class="secao">
        <h2>Tipos de erros encontrados</h2>

        <p v-if="!store.totalErros" class="sem-erros">
          Nenhum erro foi encontrado na validação.
        </p>

        <div v-else class="lista-tipos">
          <article
            v-for="(quantidade, tipo) in store.tiposErros"
            :key="tipo"
            class="tipo-erro"
          >
            <span>{{ tipo }}</span>
            <strong>{{ quantidade }}</strong>
          </article>
        </div>
      </section>

      <!-- Detalhamento dos erros -->
      <section class="secao">
        <h2>Detalhamento dos erros</h2>

        <div v-if="!store.detalhesErros.length" class="sem-erros">
          Não existem erros para exibir.
        </div>

        <div v-else class="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Linha</th>
                <th>Campo</th>
                <th>Tipo de erro</th>
                <th>Descrição</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(erro, indice) in store.detalhesErros"
                :key="`${erro.linha}-${erro.campo}-${indice}`"
              >
                <td>{{ erro.linha }}</td>
                <td>{{ erro.campo }}</td>
                <td>{{ erro.tipo }}</td>
                <td>{{ erro.descricao }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Clientes invalidados -->
      <section class="secao">
        <h2>Clientes invalidados</h2>

        <div v-if="!store.dadosInvalidados.length" class="sem-erros">
          Todos os clientes foram validados.
        </div>

        <div v-else class="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome do cliente</th>
                <th>Nível</th>
                <th>Erros encontrados</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(cliente, indice) in store.dadosInvalidados"
                :key="`${cliente.codigo_cliente}-${indice}`"
              >
                <td>{{ cliente.codigo_cliente || "Não informado" }}</td>
                <td>{{ cliente.nome_cliente || "Não informado" }}</td>
                <td>{{ cliente.nivel_cliente || "Não informado" }}</td>
                <td>
                  <ul>
                    <li v-for="(erro, posicao) in cliente.erros" :key="posicao">
                      {{ erro }}
                    </li>
                  </ul>
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

<style scoped>
.relatorios {
  padding: 24px;
  color: #1f2937;
}

.cabecalho {
  margin-bottom: 24px;
}

.cabecalho h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.cabecalho p,
.descricao {
  color: #64748b;
  margin: 0;
}

.estado-vazio {
  padding: 32px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  text-align: center;
  background: #f8fafc;
}

.estado-vazio p {
  color: #64748b;
  line-height: 1.6;
}

.arquivo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.rotulo,
.card span {
  display: block;
  color: #64748b;
  font-size: 14px;
}

.arquivo h2 {
  margin: 6px 0 0;
  font-size: 18px;
  overflow-wrap: anywhere;
}

.status {
  padding: 8px 12px;
  border-radius: 20px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
}

.indicadores {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.card strong {
  display: block;
  margin-top: 12px;
  font-size: 30px;
}

.card.valido strong {
  color: #15803d;
}

.card.invalido strong {
  color: #dc2626;
}

.secao {
  margin-bottom: 24px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.secao h2 {
  margin: 0 0 20px;
  font-size: 19px;
}

.progresso-info {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.barra {
  height: 12px;
  overflow: hidden;
  border-radius: 10px;
  background: #e2e8f0;
}

.barra-preenchida {
  height: 100%;
  border-radius: 10px;
  background: #16a34a;
  transition: width 0.3s ease;
}

.descricao {
  margin-top: 12px;
  font-size: 14px;
}

.lista-tipos {
  display: grid;
  gap: 12px;
}

.tipo-erro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border-radius: 8px;
  background: #fff7ed;
}

.tipo-erro strong {
  min-width: 32px;
  text-align: center;
  color: #c2410c;
}

.sem-erros {
  color: #15803d;
  padding: 12px 0;
}

.tabela-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 14px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

th {
  background: #f8fafc;
  font-size: 13px;
  color: #475569;
}

td {
  font-size: 14px;
}

td ul {
  margin: 0;
  padding-left: 18px;
}

@media (max-width: 900px) {
  .indicadores {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .relatorios {
    padding: 14px;
  }

  .indicadores {
    grid-template-columns: 1fr;
  }

  .secao {
    padding: 16px;
  }
}
</style>