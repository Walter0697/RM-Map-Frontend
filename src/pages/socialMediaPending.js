export function getPendingSocialMediaAnalysisJobID(search) {
    return new URLSearchParams(search || '').get('job_id') || ''
}

export async function fetchPendingSocialMediaAnalysis(fetchImpl, baseURL, jwt) {
    const response = await fetchImpl(`${baseURL}/settings/social-media-analysis/pending`, {
        method: 'GET',
        headers: { Authorization: jwt },
    })
    if (!response.ok) throw new Error('Could not load pending markers.')
    const payload = await response.json()
    return {
        count: Number(payload?.count || 0),
        items: Array.isArray(payload?.items) ? payload.items : [],
    }
}

export async function updatePendingSocialMediaAnalysis(fetchImpl, baseURL, jwt, jobID, action) {
    const response = await fetchImpl(`${baseURL}/settings/social-media-analysis/pending/${encodeURIComponent(jobID)}/${action}`, {
        method: 'POST',
        headers: { Authorization: jwt },
    })
    if (!response.ok) throw new Error(`Could not ${action} this pending marker.`)
    return response.json()
}
