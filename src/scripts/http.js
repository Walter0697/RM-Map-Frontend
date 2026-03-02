const AUTH_STATE_UNAVAILABLE_TEXT = 'auth state unavailable'
const AUTH_STATE_UNAVAILABLE_UI_MESSAGE = 'Authentication service is temporarily unavailable. Please retry in a moment.'

const isAuthStateUnavailableError = (value = '') => {
    if (!value) return false
    return String(value).toLowerCase().includes(AUTH_STATE_UNAVAILABLE_TEXT)
}

const normalizeErrorMessage = (error) => {
    if (!error) return ''
    if (typeof error === 'string') return error
    if (typeof error.message === 'string') return error.message
    return String(error)
}

const toAuthAwareErrorMessage = (error, fallback = '') => {
    const message = normalizeErrorMessage(error)
    if (isAuthStateUnavailableError(message)) {
        return AUTH_STATE_UNAVAILABLE_UI_MESSAGE
    }
    return message || fallback
}

const httpScript = {
    isAuthStateUnavailableError,
    toAuthAwareErrorMessage,
    AUTH_STATE_UNAVAILABLE_UI_MESSAGE,
}

export default httpScript
