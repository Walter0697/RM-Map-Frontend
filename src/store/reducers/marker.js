import constants from '../actions/constant'
import maphelper from '../../scripts/map'

export default function markerReducer(state = {
    markers: [],
    eventtypes: [],
    mappins: [],
}, action) {
    switch(action.type) {
        case constants.RESET_MARKERS: {
            const markers = action.markers.map(s => maphelper.converts.fillVariableForMarker(s))
            return {
                ...state,
                markers: markers,
            }
        }
        case constants.ADD_MARKER: {
            const result = state.markers || []
            let marker = maphelper.converts.fillVariableForMarker(action.marker)
            result.push(marker)
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
        case constants.RESET_MAPPINS: {
            return {
                ...state,
                mappins: action.mappins,
            }
        }
        case constants.UPDATE_MARKER_STATUS: {
            const result = state.markers || []
            let item = result.find(s => s.id === action.marker.id)
            item.status = action.marker.status
            return {
                ...state,
                markers: result,
            }
        }
        case constants.UPDATE_MARKERS_STATUS: {
            const result = state.markers || []
            for (let i = 0; i < action.markers.length; i++) {
                let item = result.find(s => s.id === action.markers[i].id)
                if (item) {
                    item.status = action.markers[i].status
                } else {
                    result.push(action.markers[i])
                }
                
            }
            return {
                ...state,
                markers: result,
            }
        }
        default:
            return state
    }
}