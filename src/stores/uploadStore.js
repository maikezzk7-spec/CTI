import { defineStore } from 'pinia'

import * as XLSX from 'xlsx'

export const useUploadStore = defineStore('upload', {

  state: () => ({

    arquivo: null,
    dadosOriginais: [],
    dadosTratados: [],
    dadosValidados: [],
    dadosInvalidados: [],
    erros: [],
    tiposErros:{},
    statusValidacao: 'Aguardando o arquivo',
    carregando: false

  }),

  getters: {

    totalClientes: (state) => state.dadosTratados.length,

    totalErros: (state) => state.erros.length,

    clientesNivelA: (state) =>
      state.dadosTratados.filter(
        cliente => cliente.nivel_cliente === 'A'
      ).length,

    temDados: (state) => state.dadosTratados.length > 0,

    totalValidados: (state) => state.dadosValidados.length,

    totalInvalidados: (state) => state.dadosInvalidados.length,

    percentualValido: (state) => {

      if (state.dadosTratados.length === 0) {
        return 0
      }

      return Math.round(
        (state.dadosValidados.length / state.dadosTratados.length) * 100
      )

    }

  },

  actions: {

    selecionarArquivo(arquivo) {

      this.arquivo = arquivo
      this.dadosOriginais = []
      this.dadosTratados = []
      this.dadosValidados = []
      this.dadosInvalidados = []
      this.statusValidacao = 'Arquivo selecionado'
      this.erros = []
      this.tiposErros = {}
    },

    validarArquivo() {

      if (!this.arquivo) {

        this.erros = ['Selecione um arquivo.']

        return false

      }

      const extensoesPermitidas = ['.xlsx', '.xls', '.csv']

      const nomeArquivo = this.arquivo.name.toLowerCase()

      const valido = extensoesPermitidas.some(extensao =>
        nomeArquivo.endsWith(extensao)
      )

      if (!valido) {

        this.erros = ['Formato de arquivo não permitido.']

        return false

      }

      return true

    },

    async processarPlanilha() {

      if (!this.validarArquivo()) return

      this.carregando = true

      this.erros = []

      try {

        const buffer = await this.arquivo.arrayBuffer()

        const workbook = XLSX.read(buffer)

        const primeiraAba = workbook.SheetNames[0]

        const planilha = workbook.Sheets[primeiraAba]

        const linhas = XLSX.utils.sheet_to_json(planilha)

        this.dadosOriginais = linhas

        this.dadosTratados = linhas.map(this.tratarLinha)

        this.validarDados()

      } catch (error) {

        this.erros = ['Erro ao processar a planilha.']

        console.error(error)

      } finally {

        this.carregando = false

      }

    },

    tratarLinha(linha) {

      const segmento = String(linha.segmento || '')
        .trim()
        .toUpperCase()

      const mapaSegmentos = {

        'IND.': 'Indústria',

        'INDUSTRIA': 'Indústria',

        'INDÚSTRIA': 'Indústria',

        'COMERCIO': 'Comércio',

        'COMÉRCIO': 'Comércio',

        'SERVICOS': 'Serviços',

        'SERVIÇOS': 'Serviços'

      }

      return {

        ...linha,

        consultor: String(linha.consultor || '').trim(),

        segmento: mapaSegmentos[segmento] || segmento,

        nivel_cliente: String(linha.nivel_cliente || '')
          .trim()
          .toUpperCase()

      }

    },

    validarDados() {

      this.dadosValidados = []

      this.dadosInvalidados = []

      this.erros = []

      this.tiposErros = {}

      const codigos = new Set()

      this.dadosTratados.forEach((linha, index) => {

        const errosLinha = []

        const numeroLinha = index + 2

        // Código obrigatório
        if (!linha.codigo_cliente) {
          errosLinha.push('Código do cliente está vazio.')
        }

        // Nome obrigatório
        if (!linha.nome_cliente) {
          errosLinha.push('Nome do cliente está vazio.')
        }

        // Consultor obrigatório
        if (!linha.consultor) {
          errosLinha.push('Consultor está vazio.')
        }

        // Segmento obrigatório
        if (!linha.segmento) {
          errosLinha.push('Segmento está vazio.')
        }

        // Nível deve ser A, B ou C
        if (!['A', 'B', 'C'].includes(linha.nivel_cliente)) {
          errosLinha.push('Nível do cliente deve ser A, B ou C.')
        }

        // Verificar código duplicado
        if (linha.codigo_cliente) {

          if (codigos.has(linha.codigo_cliente)) {
            errosLinha.push('Código do cliente duplicado.')
          }

          codigos.add(linha.codigo_cliente)

        }

        // Separar válido e inválido
        if (errosLinha.length === 0) {

          this.dadosValidados.push(linha)

        } else {

          this.dadosInvalidados.push({
            ...linha,
            erros: errosLinha
          })

          errosLinha.forEach(erro => {
            this.erros.push(`Linha ${numeroLinha}: ${erro}`)

            if (!this.tiposErros[erro]){
              this.tiposErros[erro] = 0
            }

            this.tiposErros[erro]++
          })

        }

      })

      if (this.dadosInvalidados.length === 0) {

        this.statusValidacao = 'Validação concluída com sucesso.'

      } else {

        this.statusValidacao = 'Arquivo possui inconsistências.'

      }

    }

  }

})