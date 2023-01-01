import constants from '../actions/constant'
import maphelper from '../../scripts/map'

export default function markerReducer(state = {
    markers: [],
    eventtypes: [],
    mappins: [],
    countrycodes: [],
    countryparts: [],
    filtercountry: null,
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
            const before = state.markers || []
            let result = Object.assign([], before)
            let item = result.find(s => s.id === action.id)
            item.is_fav = action.is_fav
            return {
                ...state,
                markers: result,
            }
        }
        case constants.EDIT_MARKER: {
            const result = state.markers || []
            let index = result.findIndex(s => s.id === action.marker.id)
            result[index] = action.marker
            return {
                ...state,
                markers: result
            }
        }
        case constants.REMOVE_MARKER: {
            const result = state.markers || []
            let item = result.find(s => s.id === action.id)
            item.status = 'cancelled'
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
            if (action.marker) {
                let item = result.find(s => s.id === action.marker.id)
                if (item) {
                    item.status = action.marker.status
                } else {
                    result.push(action.marker)
                }
            }
            
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
        case constants.REVOKE_MARKER: {
            const result = state.markers || []
            let item = result.find(s => s.id === action.marker.id)
            if (item) {
                item.status = ''
            } else {
                result.push(action.marker)
            }

            return {
                ...state,
                markers: result,
            }
        }
        case constants.RESET_COUNTRYCODE: {
            return {
                ...state,
                countrycodes: action.countryCodes,
            }
        }
        case constants.RESET_COUNTRYPARTS: {
            return {
                ...state,
                countryparts: action.countryparts,
            }
        }
        case constants.RESET_FILTERCOUNTRY: {
            return {
                ...state,
                filtercountry: action.filtered,
            }
        }
        default:
            return state
    }
}