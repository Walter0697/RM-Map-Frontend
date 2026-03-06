import deepLink from './deepLink'

test('parses marker and schedule deep-link paths', () => {
    expect(deepLink.parsePath('/markers/101')).toEqual({
        resourceType: 'marker',
        id: '101',
        path: '/markers/101',
    })

    expect(deepLink.parsePath('/schedules/202')).toEqual({
        resourceType: 'schedule',
        id: '202',
        path: '/schedules/202',
    })

    expect(deepLink.parsePath('/markers')).toBe(null)
    expect(deepLink.parsePath('/schedule')).toBe(null)
})

test('resolves post-login navigation for first replay and stale replay', () => {
    const firstReplay = deepLink.resolvePostLoginNavigation({
        resourceType: 'marker',
        id: '333',
        replayCount: 0,
    })
    expect(firstReplay).toEqual({
        path: '/markers/333',
        shouldIncrementReplay: true,
        shouldClearIntent: false,
    })

    const staleReplay = deepLink.resolvePostLoginNavigation({
        resourceType: 'schedule',
        id: '444',
        replayCount: 2,
    })
    expect(staleReplay).toEqual({
        path: '/home',
        shouldIncrementReplay: false,
        shouldClearIntent: true,
    })
})

test('validates positive integer IDs for deep-link resolution', () => {
    expect(deepLink.parsePositiveIntId('15')).toBe(15)
    expect(deepLink.parsePositiveIntId('0')).toBe(null)
    expect(deepLink.parsePositiveIntId('-1')).toBe(null)
    expect(deepLink.parsePositiveIntId('abc')).toBe(null)
})
