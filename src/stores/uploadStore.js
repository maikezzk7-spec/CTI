import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'

export const useUploadStore = defineStore('upload', {
  state: () => ({
    arquivo: null,
    dadosOriginais: [],
    dadosTratados: [],
    erros: [],
    carregando: false
  }),

  getters: {
    totalClientes: (state) => state.dadosTratados.length,

    totalErros: (state) => state.erros.length,

    clientesNivelA: (state) =>
        state.dadosTratados.filter(
            cliente => cliente.nivel_cliente === 'A'
        ).length,

    temDados: (state) => state.dadosTratados.length > 0
  },

  actions: {

    selecionarArquivo(arquivo) {
      this.arquivo = arquivo
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