import { defineStore } from "pinia";
import { validarEstruturaArquivo } from "../utils/validarEstruturaArquivo.js";

// Executa o processamento em um Web Worker separado.
function executarWorker(buffer) {
  return new Promise((resolve, reject) => {
    let worker;

    try {
      worker = new Worker(
        new URL("../workers/planilha.worker.js", import.meta.url),
        { type: "module" }
      );
    } catch (error) {
      reject(error);
      return;
    }

    let finalizado = false;

    function finalizar(erro, resultado) {
      if (finalizado) return;

      finalizado = true;

      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();

      if (erro) {
        reject(erro);
      } else {
        resolve(resultado);
      }
    }

    worker.onmessage = (evento) => {
      const mensagem = evento.data ?? {};

      if (mensagem.tipo === "PROCESSAMENTO_CONCLUIDO") {
        if (
          !mensagem.resultado ||
          typeof mensagem.resultado.sucesso !== "boolean"
        ) {
          finalizar(
            new Error("Resposta inválida do Web Worker.")
          );
          return;
        }

        finalizar(null, mensagem.resultado);
        return;
      }

      if (mensagem.tipo === "ERRO_PROCESSAMENTO") {
        finalizar(
          new Error(
            mensagem.mensagem ||
              "Erro ao processar a planilha no Web Worker."
          )
        );
      }
    };

    worker.onerror = (evento) => {
      evento.preventDefault();

      finalizar(
        new Error(
          evento.message ||
            "Falha na execução do Web Worker."
        )
      );
    };

    worker.onmessageerror = () => {
      finalizar(
        new Error(
          "Não foi possível receber os dados do Web Worker."
        )
      );
    };

    try {
      // Transfere o ArrayBuffer sem copiar seus bytes.
      worker.postMessage(
        {
          tipo: "PROCESSAR_PLANILHA",
          buffer
        },
        [buffer]
      );
    } catch (error) {
      finalizar(error);
    }
  });
}

export const useUploadStore = defineStore("upload", {
  state: () => ({
    arquivo: null,

    dadosOriginais: [],
    dadosTratados: [],
    dadosValidados: [],
    dadosInvalidados: [],

    erros: [],
    detalhesErros: [],
    tiposErros: {},

    statusValidacao: "Aguardando o arquivo",
    carregando: false
  }),

  getters: {
    totalClientes: (state) =>
      state.dadosTratados.length,

    totalErros: (state) =>
      state.erros.length,

    clientesNivelA: (state) =>
      state.dadosTratados.filter(
        (cliente) => cliente.nivel_cliente === "A"
      ).length,

    temDados: (state) =>
      state.dadosTratados.length > 0,

    totalValidados: (state) =>
      state.dadosValidados.length,

    totalInvalidados: (state) =>
      state.dadosInvalidados.length,

    nomeArquivo: (state) =>
      state.arquivo?.name || "Nenhum arquivo selecionado",

    percentualValido: (state) => {
      if (state.dadosTratados.length === 0) {
        return 0;
      }

      return Math.round(
        (state.dadosValidados.length /
          state.dadosTratados.length) * 100
      );
    }
  },

  actions: {
    // Limpa os resultados anteriores.
    limparResultados() {
      this.dadosOriginais = [];
      this.dadosTratados = [];
      this.dadosValidados = [];
      this.dadosInvalidados = [];

      this.erros = [];
      this.detalhesErros = [];
      this.tiposErros = {};
    },

    selecionarArquivo(arquivo) {
      // Não substitui um arquivo durante o processamento.
      if (this.carregando) return;

      this.arquivo = arquivo;
      this.limparResultados();

      this.statusValidacao = arquivo
        ? "Arquivo selecionado"
        : "Aguardando o arquivo";
    },

    validarArquivo() {
      this.erros = [];
      this.detalhesErros = [];
      this.tiposErros = {};

      if (!this.arquivo) {
        this.erros = ["Selecione um arquivo."];
        this.statusValidacao =
          "Nenhum arquivo selecionado.";

        return false;
      }

      // Mantém o limite de 50 MiB.
      const TAMANHO_MAXIMO = 50 * 1024 * 1024;

      if (this.arquivo.size > TAMANHO_MAXIMO) {
        this.erros = [
          "O arquivo ultrapassa o limite permitido de 50 MB."
        ];

        this.statusValidacao = "Arquivo muito grande.";
        return false;
      }

      const extensoesPermitidas = [
        ".xlsx",
        ".xls",
        ".csv"
      ];

      const nomeArquivo = this.arquivo.name.toLowerCase();

      const formatoValido = extensoesPermitidas.some(
        (extensao) => nomeArquivo.endsWith(extensao)
      );

      if (!formatoValido) {
        this.erros = [
          "Formato de arquivo não permitido."
        ];

        this.statusValidacao =
          "Formato de arquivo inválido.";

        return false;
      }

      return true;
    },

    async processarPlanilha() {
      // Impede processamentos simultâneos.
      if (this.carregando) return false;

      if (!this.validarArquivo()) {
        return false;
      }

      const arquivoAtual = this.arquivo;

      this.carregando = true;
      this.limparResultados();
      this.statusValidacao = "Verificando arquivo";

      try {
        // Primeira etapa: verifica a estrutura/assinatura.
        const verificacao = await validarEstruturaArquivo(
          arquivoAtual
        );

        if (!verificacao.valido) {
          this.erros = [verificacao.mensagem];
          this.statusValidacao =
            "Estrutura do arquivo inválida.";

          return false;
        }

        this.statusValidacao = "Processando arquivo";

        // Lê os bytes do arquivo.
        const buffer = await arquivoAtual.arrayBuffer();

        // Segunda etapa: processamento fora da thread principal.
        const resultado = await executarWorker(buffer);

        if (!resultado.sucesso) {
          this.erros = [
            resultado.mensagem ||
              "Não foi possível processar a planilha."
          ];

          this.statusValidacao =
            resultado.statusValidacao ||
            "Falha ao processar o arquivo.";

          return false;
        }

        // Terceira etapa: atualiza o Pinia.
        this.dadosOriginais =
          resultado.dadosOriginais ?? [];

        this.dadosTratados =
          resultado.dadosTratados ?? [];

        this.dadosValidados =
          resultado.dadosValidados ?? [];

        this.dadosInvalidados =
          resultado.dadosInvalidados ?? [];

        this.erros = resultado.erros ?? [];

        this.detalhesErros =
          resultado.detalhesErros ?? [];

        this.tiposErros =
          resultado.tiposErros ?? {};

        this.statusValidacao =
          resultado.statusValidacao ||
          "Validação concluída.";

        console.info(
          "[CTI Insights] Processamento pelo Web Worker concluído.",
          {
            total: this.dadosTratados.length,
            validos: this.dadosValidados.length,
            invalidos: this.dadosInvalidados.length,
            erros: this.erros.length
          }
        );

        // Mantém o comportamento anterior:
        // true indica que a leitura e a validação
        // foram executadas, mesmo com inconsistências.
        return true;
      } catch (error) {
        console.error(
          "[CTI Insights] Erro no processamento:",
          error
        );

        const extensao = arquivoAtual.name
          .split(".")
          .pop()
          ?.toLowerCase();

        if (
          this.statusValidacao === "Verificando arquivo"
        ) {
          this.erros = [
            "Não foi possível verificar a estrutura do arquivo."
          ];

          this.statusValidacao =
            "Falha na verificação do arquivo.";
        } else {
          this.erros =
            extensao === "xlsx" || extensao === "xls"
              ? [
                  "Não foi possível interpretar a estrutura da planilha Excel."
                ]
              : [
                  "Não foi possível processar o arquivo selecionado."
                ];

          this.statusValidacao =
            "Falha ao processar o arquivo.";
        }

        return false;
      } finally {
        this.carregando = false;
      }
    }
  }
});