const trimRightSlash = (value) => (value || '').replace(/\/+$/, '')
const trimLeftSlash = (value) => (value || '').replace(/^\/+/, '')

const resolveLocalDefaultBackendBaseURL = () => {
  if (typeof window === 'undefined') return ''
  const hostname = `${window.location?.hostname || ''}`.trim().toLowerCase()
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:1998'
  }
  return ''
}

const BACKEND_BASE_URL = trimRightSlash(process.env.REACT_APP_BACKEND_BASE_URL || resolveLocalDefaultBackendBaseURL())

const withBasePath = (path) => {
  if (!BACKEND_BASE_URL) return `/${trimLeftSlash(path)}`
  return `${BACKEND_BASE_URL}/${trimLeftSlash(path)}`
}

const GRAPHQL_BACKEND = withBasePath('query')

const AUTH_BACKEND = withBasePath('auth')

const APIKEY_BACKEND = AUTH_BACKEND

const IMAGE_LINK = trimRightSlash(withBasePath('image'))

const backend = {
  BACKEND_BASE_URL,
  withBasePath,
  GRAPHQL_BACKEND,
  AUTH_BACKEND,
  APIKEY_BACKEND,
  IMAGE_LINK,
}

export default backend
