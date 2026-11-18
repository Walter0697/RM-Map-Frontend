export async function establishMcpBrowserSession(authBackend, token, fetchImpl = window.fetch) {
    if (!authBackend || !token) return false

    try {
        const response = await fetchImpl(`${authBackend}/mcp/session`, {
            method: 'POST',
            credentials: 'include',
            headers: { Authorization: token },
        })
        return response.ok
    } catch (e) {
        return false
    }
}

