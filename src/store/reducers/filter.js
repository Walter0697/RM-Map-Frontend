import constants from '../actions/constant'

export default function filterReducer(state = {
    list: {},
    hashtag: null,
}, action) {
    switch (action.type) {
        case constants.UPDATE_FILTER: {
            return {
                ...state,
                list: action.value,
            }
        }
        case constants.UPDATE_HASHTAG: {
            return {
                ...state,
                hashtag: action.value,
            }
        }
        default:
            return state
    }
}