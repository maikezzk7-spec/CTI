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
    }
  }
})