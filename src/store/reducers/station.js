import constants from '../actions/constant'

export default function stationReducer(state = {
    stations: [],
    showInMap: {
        searchMap: false,
        markerMap: false,
    },
}, action) {
    switch(action.type) {
        case constants.RESET_STATIONS: {
            return {
                ...state,
                stations: action.stations,
            }
        }
        case constants.UPDATE_STATION: {
            const before = state.stations || []
            let result = Object.assign([], before)
            const index = result.findIndex(s => s.identifier === action.identifier && s.map_name === action.map_name)
            result[index].active = action.active
            return {
                ...state, 
                stations: result,
            }
        }
        case constants.SET_STATION_IN_MAP: {
            const before = state.showInMap || {}
            let result = Object.assign({}, before)
            result[action.map_type] = action.enable
            return {
                ...state,
                showInMap: result,
            }
        }
        default: 
            return state
    }
}