import {
    __setAuthSessionTestOverrides,
    consumeTerminalUnauthorizedMessage,
    handleTerminalUnauthorized,
    installAuthFetchInterceptor,
} from './authSession'

const createTestWindow = () => {
    const storage = {}
    return {
        location: {
            pathname: '/home',
            replace: jest.fn(),
        },
        sessionStorage: {
            setItem: (key, value) => {
                storage[key] = String(value)
            },
            getItem: (key) => storage[key] || null,
            removeItem: (key) => {
                delete storage[key]
            },
        },
        fetch: jest.fn(async () => ({ status: 200 })),
    }
}

describe('authSession', () => {
    afterEach(() => {
        __setAuthSessionTestOverrides(null)
    })

    test('handles terminal unauthorized by clearing auth and redirecting once', () => {
        const fakeStore = { dispatch: jest.fn() }
        const fakeActions = {
            clearDeepLinkIntent: jest.fn(() => ({ type: 'CLEAR_DEEP_LINK' })),
            logout: jest.fn(() => ({ type: 'LOGOUT' })),
        }
        const fakeWindow = createTestWindow()
        __setAuthSessionTestOverrides({
            store: fakeStore,
            actions: fakeActions,
            window: fakeWindow,
        })

        handleTerminalUnauthorized({ message: 'session expired' })
        handleTerminalUnauthorized({ message: 'session expired again' })

        expect(fakeStore.dispatch).toHaveBeenCalledWith({ type: 'CLEAR_DEEP_LINK' })
        expect(fakeStore.dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' })
        expect(fakeWindow.location.replace).toHaveBeenCalledTimes(1)
        expect(fakeWindow.location.replace).toHaveBeenCalledWith('/login')
    })

    test('consumes and clears terminal unauthorized message', () => {
        const fakeStore = { dispatch: jest.fn() }
        const fakeActions = {
            clearDeepLinkIntent: jest.fn(() => ({ type: 'CLEAR_DEEP_LINK' })),
            logout: jest.fn(() => ({ type: 'LOGOUT' })),
        }
        const fakeWindow = createTestWindow()
        __setAuthSessionTestOverrides({
            store: fakeStore,
            actions: fakeActions,
            window: fakeWindow,
        })

        handleTerminalUnauthorized({ message: 'session expired' })

        const message = consumeTerminalUnauthorizedMessage()
        const consumedAgain = consumeTerminalUnauthorizedMessage()

        expect(message).toBe('session expired')
        expect(consumedAgain).toBe('')
    })

    test('intercepts authorized fetch 401 and triggers redirect', async () => {
        const fakeStore = { dispatch: jest.fn() }
        const fakeActions = {
            clearDeepLinkIntent: jest.fn(() => ({ type: 'CLEAR_DEEP_LINK' })),
            logout: jest.fn(() => ({ type: 'LOGOUT' })),
        }
        const fakeWindow = createTestWindow()
        fakeWindow.fetch = jest.fn(async () => ({ status: 401 }))
        __setAuthSessionTestOverrides({
            store: fakeStore,
            actions: fakeActions,
            window: fakeWindow,
        })

        installAuthFetchInterceptor()
        await fakeWindow.fetch('/api/protected', { headers: { Authorization: 'jwt-token' } })

        expect(fakeWindow.location.replace).toHaveBeenCalledWith('/login')
    })
})

