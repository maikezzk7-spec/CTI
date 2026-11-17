
import { defineStore } from 'pinia'
import { api, limparCsrf } from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null,
    sessaoVerificada: false
  }),

  getters: {
    logado: (state) => !!state.usuario,

    isAdmin: (state) =>
      state.usuario?.perfil === 'ADMIN'
  },

  actions: {
    async login(email, senha) {
      const { data } = await api.post('/auth/login', {
        email,
        senha
      })

      this.usuario = data.usuario
      this.sessaoVerificada = true

      // Remove dados da autenticação antiga.
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    },

    async verificarSessao() {
      try {
        const { data } = await api.get('/auth/me')

        this.usuario = data
        this.sessaoVerificada = true

        return true
      } catch (erro) {
        if (erro.response?.status === 401) {
          this.usuario = null
          this.sessaoVerificada = true
          return false
        }

        throw erro
      }
    },

    async logout() {
      // Se a API falhar, não afirmamos que o cookie
      // foi removido pelo servidor.
      await api.post('/auth/logout')

      this.usuario = null
      this.sessaoVerificada = true

      limparCsrf()

      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }
})
