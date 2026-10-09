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

    nomeArquivo: (state) => state.arquivo?.name || 'Nenhum arquivo selecionado',

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
      this.carregando = false
    },

    validarArquivo() {
      this.erros = []
      this.tiposErros = {}

      if (!this.arquivo) {
        this.erros = ['Selecione um arquivo.']

        this.statusValidacao = 'Nenhum arquivo selecionado.'
        
        return false
      }

      const extensoesPermitidas = ['.xlsx', '.xls', '.csv']

      const nomeArquivo = this.arquivo.name.toLowerCase()

      const valido = extensoesPermitidas.some(extensao =>
        nomeArquivo.endsWith(extensao)
      )

      if (!valido) {
        this.erros = ['Formato de arquivo não permitido.']

        this.statusValidacao = 'Formato de arquivo inválido.'
        
        return false
      }

      return true

    },

    async processarPlanilha() {

      if (!this.validarArquivo()) return

      this.carregando = true

      this.erros = []

      this.tiposErros = {}

      this.dadosOriginais = []

      this.dadosTratados = []

      this.dadosValidados = []

      this.dadosInvalidados = []

      this.statusValidacao = 'Processando arquivo'

      try {

        const buffer = await this.arquivo.arrayBuffer()

        const workbook = XLSX.read(buffer)

        if (workbook.SheetNames.length === 0){
          this.erros = ['A planilha não possui abas para leitura.']

          this.statusValidacao = 'Planilha sem abas para leitura.'

          return
        }

        const primeiraAba = workbook.SheetNames[0]

        const planilha = workbook.Sheets[primeiraAba]

        const linhas = XLSX.utils.sheet_to_json(planilha)

        if (linhas.length === 0){
          this.erros = ['A planilha não contém registros para validar.']

          this.statusValidacao = 'Nenhum registro encontrado.'
         
          return
        }

        this.dadosOriginais = linhas

        this.dadosTratados = linhas.map(this.tratarLinha)

        this.validarDados()

      } catch (error) {

        this.erros = ['Erro ao processar a planilha.']

        this.statusValidacao = 'Falha ao processar o arquivo.'

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

        codigo_cliente: String(linha.codigo_cliente || '').trim(),

        nome_cliente: String(linha.nome_cliente || '').trim(),

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
        if (!String(linha.codigo_cliente || '').trim()) {
          errosLinha.push('Código do cliente está vazio.')
        }

        // Nome obrigatório
        if (!String(linha.nome_cliente || '').trim()){
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
        const codigo = String(linha.codigo_cliente || '').trim()

        if (codigo) {
          if (codigos.has(codigo)){
            errosLinha.push('Código do cliente duplicado.')
          }

          codigos.add(codigo)

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