import constants from '../actions/constant'

export default function stationReducer(state = {
    stations: [],
    showInMap: [],
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
            result[index] = action.station
            return {
                ...state, 
                stations: result,
            }
        }
        default: 
            return state
    }
}