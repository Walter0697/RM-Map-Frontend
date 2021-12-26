import constants from '../actions/constant'

export default function releaseReducer(state = {
    latest: '',
    seen: '',
    list: [],
}, action) {
    switch (action.type) {
        case constants.UPDATE_RELEASE_LIST:
            return {
                ...state,
                list: action.list,
            }
        case constants.UPDATE_RELEASE_SEEN:
            return {
                ...state,
                seen: action.seen,
            }
        case constants.UPDATE_RELEASE_LATEST:
            return {
                ...state,
                latest: action.latest,
            }
        default:
            return state
    }
}