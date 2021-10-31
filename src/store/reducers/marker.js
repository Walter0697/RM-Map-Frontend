import constants from '../actions/constant'

export default function markerReducer(state = {
    markers: [],
    eventtypes: [],
}, action) {
    switch(action.type) {
        case constants.RESET_MARKERS:
            return {
                ...state,
                markers: action.markers,
            }
        case constants.ADD_MARKER: {
            const result = state.markers || []
            result.push(action.marker)
            return {
                ...state,
                markers: result,
            }
        }
        case constants.UPDATE_MARKER_FAV: {
            const result = state.markers
            let item = result.find(s => s.id === action.id)
            item.is_fav = action.is_fav
            return {
                ...state,
                markers: result,
            }
        }
        case constants.RESET_EVENTTYPES: {
            return {
                ...state,
                eventtypes: action.eventtypes,
            }
        }
        default:
            return state
    }
}