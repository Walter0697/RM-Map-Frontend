import deepLinkReducer from './deepLink'
import constants from '../actions/constant'

test('stores and clears deep-link intent', () => {
    const stored = deepLinkReducer(undefined, {
        type: constants.SET_DEEP_LINK_INTENT,
        intent: {
            resourceType: 'marker',
            id: '123',
            path: '/markers/123',
        },
    })

    expect(stored.pending).toMatchObject({
        resourceType: 'marker',
        id: '123',
        path: '/markers/123',
        replayCount: 0,
    })

    const cleared = deepLinkReducer(stored, {
        type: constants.CLEAR_DEEP_LINK_INTENT,
    })
    expect(cleared.pending).toBe(null)
})

test('increments deep-link replay count', () => {
    const withIntent = {
        pending: {
            resourceType: 'schedule',
            id: '77',
            path: '/schedules/77',
            replayCount: 0,
        },
    }

    const replayed = deepLinkReducer(withIntent, {
        type: constants.INCREMENT_DEEP_LINK_REPLAY,
    })

    expect(replayed.pending.replayCount).toBe(1)
})
