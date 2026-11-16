export async function fetchSocialMediaAPIKeys(fetchImpl, baseURL, jwt) {
    const response = await fetchImpl(`${baseURL}/settings/api-keys/social-shortcut`, {
        method: 'GET',
        headers: { Authorization: jwt },
    })
    if (!response.ok) throw new Error('Could not load Shortcut API keys.')
    const payload = await response.json()
    return Array.isArray(payload?.items) ? payload.items : []
}

export async function revokeSocialMediaAPIKey(fetchImpl, baseURL, jwt, id) {
    const response = await fetchImpl(`${baseURL}/settings/api-keys/social-shortcut/${id}/revoke`, {
        method: 'POST',
        headers: { Authorization: jwt },
    })
    if (!response.ok) throw new Error('Could not revoke the Shortcut API key.')
}
