import { defineStore } from 'pinia'
import { api } from '../services/api'

// Lê os dados locais sem interromper a aplicação
// caso estejam ausentes ou corrompidos.
function carregarUsuarioSalvo() {
  try {
    const usuarioSalvo = localStorage.getItem('usuario')

    if (!usuarioSalvo) {
      return null
    }

    const usuario = JSON.parse(usuarioSalvo)

    if (
      !usuario ||
      typeof usuario !== 'object' ||
      Array.isArray(usuario)
    ) {
      return null
    }

    return usuario
  } catch (erro) {
    console.warn(
      'Não foi possível recuperar os dados do usuário:',
      erro
    )

    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    usuario: carregarUsuarioSalvo()
  }),

  getters: {
    logado: (state) => !!state.token,

    // Indica o perfil apresentado na interface.
    // A autorização real deve ser feita pelo backend.
    isAdmin: (state) => state.usuario?.perfil === 'ADMIN'
  },

  actions: {
    async login(email, senha) {
      const { data } = await api.post('/auth/login', {
        email,
        senha
      })

      this.token = data.token
      this.usuario = data.usuario

      localStorage.setItem('token', data.token)
      localStorage.setItem(
        'usuario',
        JSON.stringify(data.usuario)
      )
    },

    async verificarSessao() {
      if (!this.token) {
        return false
      }

      try {
        const { data } = await api.get('/auth/me')

        // Atualiza o perfil com os dados do servidor.
        this.usuario = data

        localStorage.setItem(
          'usuario',
          JSON.stringify(data)
        )

        return true
      } catch (erro) {
        // Token rejeitado pelo servidor.
        if (erro.response?.status === 401) {
          this.logout()
          return false
        }

        // Erros temporários não invalidam automaticamente
        // uma sessão.
        throw erro
      }
    },

    logout() {
      this.token = null
      this.usuario = null

      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }
})