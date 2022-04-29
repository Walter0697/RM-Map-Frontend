import constants from '../actions/constant'

export default function filterReducer(state = {
    list: null,
}, action) {
    switch (action.type) {
        case constants.UPDATE_FILTER: {
            return {
                ...state,
                list: action.value,
            }
        }
        default:
                return state
    }
}