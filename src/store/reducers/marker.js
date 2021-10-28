import constants from '../actions/constant'

export default function markerReducer(state = {
    markers: [],
}, action) {
    switch(action.type) {
        case constants.RESET_MARKERS:
            return {
                markers: action.markers,
            }
        case constants.ADD_MARKER: {
            const result = state.markers
            result.push(action.marker)
            return {
                markers: result,
            }
        }
        case constants.UPDATE_MARKER_FAV: {
            const result = state.markers
            let item = result.find(s => s.id === action.marker.id)
            item.is_fav = action.marker.is_fav
            return {
                markers: result,
            }
        }
        default:
            return state
    }
}