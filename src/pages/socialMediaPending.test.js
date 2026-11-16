import { fetchPendingSocialMediaAnalysis, getPendingSocialMediaAnalysisJobID } from './socialMediaPending'

test('getPendingSocialMediaAnalysisJobID reads the review deep link', () => {
    expect(getPendingSocialMediaAnalysisJobID('?job_id=analysis_123')).toBe('analysis_123')
    expect(getPendingSocialMediaAnalysisJobID('')).toBe('')
})

test('fetchPendingSocialMediaAnalysis returns pending items and count', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 2, items: [{ job_id: 'analysis_1' }, { job_id: 'analysis_2' }] }),
    })

    await expect(fetchPendingSocialMediaAnalysis(fetchImpl, 'http://api.test', 'jwt-token'))
        .resolves.toEqual({ count: 2, items: [{ job_id: 'analysis_1' }, { job_id: 'analysis_2' }] })
    expect(fetchImpl).toHaveBeenCalledWith('http://api.test/settings/social-media-analysis/pending', {
        method: 'GET',
        headers: { Authorization: 'jwt-token' },
    })
})
