import { defineStore } from "pinia";
import * as XLSX from "xlsx";

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
    carregando: false,
  }),

  getters: {
    totalClientes: (state) => state.dadosTratados.length,

    totalErros: (state) => state.erros.length,

    clientesNivelA: (state) =>
      state.dadosTratados.filter((cliente) => cliente.nivel_cliente === "A")
        .length,

    temDados: (state) => state.dadosTratados.length > 0,

    totalValidados: (state) => state.dadosValidados.length,

    totalInvalidados: (state) => state.dadosInvalidados.length,

    nomeArquivo: (state) => state.arquivo?.name || "Nenhum arquivo selecionado",

    percentualValido: (state) => {
      if (state.dadosTratados.length === 0) {
        return 0;
      }

      return Math.round(
        (state.dadosValidados.length / state.dadosTratados.length) * 100,
      );
    },
  },

  actions: {
    selecionarArquivo(arquivo) {
      this.arquivo = arquivo;
      this.dadosOriginais = [];
      this.dadosTratados = [];
      this.dadosValidados = [];
      this.dadosInvalidados = [];
      this.erros = [];
      this.detalhesErros = [];
      this.tiposErros = {};
      this.statusValidacao = arquivo
        ? "Arquivo selecionado"
        : "Aguardando o arquivo";
      this.carregando = false;
    },

    validarArquivo() {
      this.erros = [];
      this.detalhesErros = [];
      this.tiposErros = {};

      if (!this.arquivo) {
        this.erros = ["Selecione um arquivo."];
        this.statusValidacao = "Nenhum arquivo selecionado.";
        return false;
      }

      const extensoesPermitidas = [".xlsx", ".xls", ".csv"];
      const nomeArquivo = this.arquivo.name.toLowerCase();

      const valido = extensoesPermitidas.some((extensao) =>
        nomeArquivo.endsWith(extensao),
      );

      if (!valido) {
        this.erros = ["Formato de arquivo não permitido."];
        this.statusValidacao = "Formato de arquivo inválido.";
        return false;
      }

      return true;
    },

    async processarPlanilha() {
      if (!this.validarArquivo()) return false;

      this.carregando = true;
      this.erros = [];
      this.detalhesErros = [];
      this.tiposErros = {};
      this.dadosOriginais = [];
      this.dadosTratados = [];
      this.dadosValidados = [];
      this.dadosInvalidados = [];
      this.statusValidacao = "Processando arquivo";

      try {
        const buffer = await this.arquivo.arrayBuffer();

        const workbook = XLSX.read(buffer, {
          type: "array",
          cellDates: true,
        });

        if (workbook.SheetNames.length === 0) {
          this.erros = ["A planilha não possui abas para leitura."];
          this.statusValidacao = "Planilha sem abas para leitura.";
          return false;
        }

        // Usa a aba da atividade quando ela existir.
        // Para outras planilhas, utiliza a primeira aba.
        const nomeAba = workbook.SheetNames.includes("upload_clientes")
          ? "upload_clientes"
          : workbook.SheetNames[0];

        const planilha = workbook.Sheets[nomeAba];

        const linhas = XLSX.utils.sheet_to_json(planilha, {
          defval: "",
          raw: true,
          blankrows: false,
        });

        if (linhas.length === 0) {
          this.erros = ["A planilha não contém registros para validar."];
          this.statusValidacao = "Nenhum registro encontrado.";
          return false;
        }

        this.dadosOriginais = linhas;
        this.dadosTratados = linhas.map((linha) => this.tratarLinha(linha));

        this.validarDados();

        return true;
      } catch (error) {
        console.error("Erro ao processar a planilha:", error);

        this.erros = ["Erro ao processar a planilha."];
        this.statusValidacao = "Falha ao processar o arquivo.";

        return false;
      } finally {
        this.carregando = false;
      }
    },

    tratarLinha(linha) {
      const texto = (valor) =>
        valor === null || valor === undefined ? "" : String(valor).trim();

      const dados = { ...linha };

      dados.codigo_cliente = texto(dados.codigo_cliente).toUpperCase();
      dados.nome_cliente = texto(dados.nome_cliente);
      dados.consultor = texto(dados.consultor);
      dados.nivel_cliente = texto(dados.nivel_cliente).toUpperCase();
      dados.cidade = texto(dados.cidade);
      dados.uf = texto(dados.uf).toUpperCase();
      dados.servicos_contratados = texto(dados.servicos_contratados);

      // Padronização dos segmentos, sem depender de acentos.
      const segmentoOriginal = texto(dados.segmento);

      const segmentoNormalizado = segmentoOriginal
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

      const mapaSegmentos = {
        "IND.": "Indústria",
        INDUSTRIA: "Indústria",
        COMERCIO: "Comércio",
        SERVICOS: "Serviços",
        SAUDE: "Saúde",
        EDUCACAO: "Educação",
        TECNOLOGIA: "Tecnologia",
      };

      dados.segmento = mapaSegmentos[segmentoNormalizado] || segmentoOriginal;

      // Converte faturamento textual para número quando possível.
      const faturamento = dados.faturamento_anual;

      if (typeof faturamento === "string") {
        const valor = faturamento.trim();

        if (valor === "") {
          dados.faturamento_anual = "";
        } else {
          const convertido = Number(valor.replace(/\./g, "").replace(",", "."));

          dados.faturamento_anual = Number.isFinite(convertido)
            ? convertido
            : valor;
        }
      }

      // Normaliza datas para DD/MM/AAAA.
      const data = dados.data_contratacao;

      if (data instanceof Date && !Number.isNaN(data.getTime())) {
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const ano = data.getFullYear();

        dados.data_contratacao = `${dia}/${mes}/${ano}`;
      } else if (typeof data === "number" && Number.isFinite(data)) {
        const dataExcel = XLSX.SSF.parse_date_code(data);

        if (dataExcel) {
          const dia = String(dataExcel.d).padStart(2, "0");
          const mes = String(dataExcel.m).padStart(2, "0");
          const ano = dataExcel.y;

          dados.data_contratacao = `${dia}/${mes}/${ano}`;
        }
      } else {
        dados.data_contratacao = texto(data);
      }

      return dados;
    },

    validarDados() {
      this.dadosValidados = [];
      this.dadosInvalidados = [];
      this.erros = [];
      this.detalhesErros = [];
      this.tiposErros = {};

      const codigos = new Set();

      // Estes são os campos da planilha da atividade.
      // Por enquanto, os dez são tratados como obrigatórios.
      const camposObrigatorios = [
        ["codigo_cliente", "Código do cliente"],
        ["nome_cliente", "Nome do cliente"],
        ["consultor", "Consultor"],
        ["segmento", "Segmento"],
        ["nivel_cliente", "Nível do cliente"],
        ["faturamento_anual", "Faturamento anual"],
        ["servicos_contratados", "Serviços contratados"],
        ["data_contratacao", "Data de contratação"],
        ["cidade", "Cidade"],
        ["uf", "UF"],
      ];

      this.dadosTratados.forEach((linha, index) => {
        const numeroLinha = index + 2;
        const errosLinha = [];
        const detalhesLinha = [];

        const registrarErro = (campo, tipo, descricao) => {
          const detalhe = {
            linha: numeroLinha,
            campo,
            tipo,
            descricao,
          };

          errosLinha.push(descricao);
          detalhesLinha.push(detalhe);
          this.detalhesErros.push(detalhe);

          this.erros.push(`Linha ${numeroLinha} — ${campo}: ${descricao}`);

          this.tiposErros[tipo] = (this.tiposErros[tipo] || 0) + 1;
        };

        // Verifica o preenchimento dos campos.
        camposObrigatorios.forEach(([campo, nomeCampo]) => {
          const valor = linha[campo];

          if (
            valor === null ||
            valor === undefined ||
            String(valor).trim() === ""
          ) {
            registrarErro(
              nomeCampo,
              "Campo obrigatório",
              `${nomeCampo} não foi preenchido.`,
            );
          }
        });

        // O nível do cliente deve ser A, B ou C.
        if (
          linha.nivel_cliente &&
          !["A", "B", "C"].includes(linha.nivel_cliente)
        ) {
          registrarErro(
            "Nível do cliente",
            "Nível inválido",
            "O nível deve ser A, B ou C.",
          );
        }

        // Verifica códigos duplicados.
        const codigo = String(linha.codigo_cliente || "")
          .trim()
          .toUpperCase();

        if (codigo) {
          if (codigos.has(codigo)) {
            registrarErro(
              "Código do cliente",
              "Código duplicado",
              `O código ${codigo} já apareceu em outro registro.`,
            );
          } else {
            codigos.add(codigo);
          }
        }

        // O faturamento precisa ser numérico e não negativo.
        const faturamento = linha.faturamento_anual;

        if (
          faturamento !== "" &&
          faturamento !== null &&
          faturamento !== undefined
        ) {
          if (
            typeof faturamento !== "number" ||
            !Number.isFinite(faturamento)
          ) {
            registrarErro(
              "Faturamento anual",
              "Faturamento inválido",
              "O faturamento deve ser um número válido.",
            );
          } else if (faturamento < 0) {
            registrarErro(
              "Faturamento anual",
              "Faturamento inválido",
              "O faturamento não pode ser negativo.",
            );
          }
        }

        // Verifica a data e o formato DD/MM/AAAA.
        const data = String(linha.data_contratacao || "").trim();

        if (data) {
          const correspondencia = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

          if (correspondencia) {
            const dia = Number(correspondencia[1]);
            const mes = Number(correspondencia[2]);
            const ano = Number(correspondencia[3]);

            const dataTeste = new Date(ano, mes - 1, dia);

            const dataValida =
              dataTeste.getFullYear() === ano &&
              dataTeste.getMonth() === mes - 1 &&
              dataTeste.getDate() === dia;

            if (!dataValida) {
              registrarErro(
                "Data de contratação",
                "Data inválida",
                "A data informada não existe no calendário.",
              );
            }
          } else {
            registrarErro(
              "Data de contratação",
              "Data inválida",
              "Utilize o formato DD/MM/AAAA.",
            );
          }
        }

        // A UF deve conter duas letras.
        if (linha.uf && !/^[A-Z]{2}$/.test(linha.uf)) {
          registrarErro("UF", "UF inválida", "A UF deve conter duas letras.");
        }

        // Se houver erros, o registro fica como inválido.
        if (errosLinha.length === 0) {
          this.dadosValidados.push(linha);
        } else {
          this.dadosInvalidados.push({
            ...linha,
            linhaPlanilha: numeroLinha,
            erros: errosLinha,
            detalhesErros: detalhesLinha,
          });
        }
      });

      if (this.dadosInvalidados.length === 0) {
        this.statusValidacao = "Validação concluída com sucesso.";
      } else {
        this.statusValidacao = "Arquivo possui inconsistências.";
      }

      return this.dadosInvalidados.length === 0;
    },
  },
});
