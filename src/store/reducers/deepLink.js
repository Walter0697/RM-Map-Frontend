import constants from '../actions/constant'

const initialState = {
    pending: null,
}

export default function deepLinkReducer(state = initialState, action) {
    switch (action.type) {
        case constants.SET_DEEP_LINK_INTENT: {
            if (!action.intent) return state
            return {
                ...state,
                pending: {
                    resourceType: action.intent.resourceType,
                    id: `${action.intent.id}`,
                    path: action.intent.path,
                    replayCount: action.intent.replayCount || 0,
                    createdAt: action.intent.createdAt || Date.now(),
                },
            }
        }
        case constants.CLEAR_DEEP_LINK_INTENT:
            return {
                ...state,
                pending: null,
            }
        case constants.INCREMENT_DEEP_LINK_REPLAY: {
            if (!state.pending) return state
            return {
                ...state,
                pending: {
                    ...state.pending,
                    replayCount: (state.pending.replayCount || 0) + 1,
                },
            }
        }
        default:
            return state
    }
}
