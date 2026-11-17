import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',

  headers: {
    'Content-Type': 'application/json'
  },

  withCredentials: true,

  timeout: 30000
})

// Busca um token CSRF atualizado no backend.
// Não armazena o JWT no JavaScript.
let csrfPendente = null

export async function prepararCsrf() {
  if (!csrfPendente) {
    csrfPendente = api
      .get('/auth/csrf')
      .then(({ data }) => data.token)
      .finally(() => {
        csrfPendente = null
      })
  }

  return csrfPendente
}

export function limparCsrf() {
  csrfPendente = null
}

// Requisições que modificam dados exigem CSRF.
api.interceptors.request.use(async (config) => {
  const metodo = (config.method || 'get').toLowerCase()

  const precisaCsrf = [
    'post',
    'put',
    'patch',
    'delete'
  ].includes(metodo)

  if (precisaCsrf) {
    const token = await prepararCsrf()

    config.headers.set('X-XSRF-TOKEN', token)
  }

  return config
})