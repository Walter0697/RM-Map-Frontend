const TERMINAL_UNAUTHORIZED_MESSAGE_KEY = 'rm_auth_terminal_message'

let redirectInProgress = false
let fetchInterceptorInstalled = false

let testOverrides = null

const getWindow = () => {
    if (testOverrides && testOverrides.window !== undefined) return testOverrides.window
    if (typeof window === 'undefined') return null
    return window
}

const getStore = () => {
    if (testOverrides && testOverrides.store) return testOverrides.store
    return require('../store').default
}

const getActions = () => {
    if (testOverrides && testOverrides.actions) return testOverrides.actions
    return require('../store/actions').default
}

const persistTerminalMessage = (message) => {
    const win = getWindow()
    if (!win || !win.sessionStorage) return
    if (!message) return
    win.sessionStorage.setItem(TERMINAL_UNAUTHORIZED_MESSAGE_KEY, message)
}

const hasRequestAuthorization = (input, init = {}) => {
    const initHeaders = init.headers
    if (initHeaders && typeof initHeaders.get === 'function') {
        if (initHeaders.get('Authorization') || initHeaders.get('authorization')) return true
    }
    if (initHeaders && typeof initHeaders === 'object') {
        if (initHeaders.Authorization || initHeaders.authorization) return true
    }

    if (input && typeof input === 'object' && input.headers && typeof input.headers.get === 'function') {
        if (input.headers.get('Authorization') || input.headers.get('authorization')) return true
    }

    return false
}

export const handleTerminalUnauthorized = ({
    message = 'Your session expired or was revoked. Please log in again.',
} = {}) => {
    const dispatchStore = getStore()
    const authActions = getActions()
    dispatchStore.dispatch(authActions.clearDeepLinkIntent())
    dispatchStore.dispatch(authActions.logout())
    persistTerminalMessage(message)

    const win = getWindow()
    if (!win || !win.location) return
    if (win.location.pathname.startsWith('/login')) return
    if (redirectInProgress) return

    redirectInProgress = true
    win.location.replace('/login')
}

export const consumeTerminalUnauthorizedMessage = () => {
    const win = getWindow()
    if (!win || !win.sessionStorage) return ''
    const message = win.sessionStorage.getItem(TERMINAL_UNAUTHORIZED_MESSAGE_KEY) || ''
    if (message) {
        win.sessionStorage.removeItem(TERMINAL_UNAUTHORIZED_MESSAGE_KEY)
    }
    return message
}

export const installAuthFetchInterceptor = () => {
    const win = getWindow()
    if (!win || typeof win.fetch !== 'function') return
    if (fetchInterceptorInstalled) return

    const nativeFetch = win.fetch.bind(win)
    win.fetch = async (input, init = {}) => {
        const response = await nativeFetch(input, init)
        if (response && response.status === 401 && hasRequestAuthorization(input, init)) {
            handleTerminalUnauthorized()
        }
        return response
    }

    fetchInterceptorInstalled = true
}

export const __setAuthSessionTestOverrides = (overrides) => {
    testOverrides = overrides || null
    redirectInProgress = false
    fetchInterceptorInstalled = false
}
