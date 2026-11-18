import { establishMcpBrowserSession } from './mcpSession'

test('establishes the API-domain MCP browser session with the current JWT', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true })

    await expect(establishMcpBrowserSession('https://api.example/auth', 'jwt-token', fetchImpl)).resolves.toBe(true)
    expect(fetchImpl).toHaveBeenCalledWith('https://api.example/auth/mcp/session', {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: 'jwt-token' },
    })
})
