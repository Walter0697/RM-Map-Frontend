import constants from '../actions/constant'
import _ from 'lodash'

export default function countryReducer(state = {
    countryPoints: [],
    countryLocations: [],
    currentShowPoints: {},
}, action) {
    switch(action.type) {
        case constants.RESET_CURRENTSHOW: {
            return {
                ...state,
                currentShowPoints: action.currentShowPoints,
            }
        }
        case constants.RESET_COUNTRYPOINT: {
            const byMapName = {}
            action.countryPoints.forEach(point => {
                if (!byMapName[point.map_name]) {
                    byMapName[point.map_name] = []
                }
                byMapName[point.map_name].push(point)
            })

            const showPoints = Object.assign({}, state.currentShowPoints)
            
            for (const mapName in byMapName) {
                const list = byMapName[mapName]
                if (!showPoints[mapName]) {
                    showPoints[mapName] = { top: null, bottom: null }
                }
                if (list.length >= 1) {
                    if (!showPoints[mapName].top) {
                        showPoints[mapName].top = list[0].id
                    }
                }
                if (list.length >= 2) {
                    if (!showPoints[mapName].bottom) {
                        showPoints[mapName].bottom = list[1].id
                    }
                }
            }
            return {
                ...state,
                countryPoints: action.countryPoints,
                currentShowPoints: showPoints,
            }
        }
        case constants.ADD_COUNTRYPOINT: {
            const result = Object.assign([], state.countryPoints)
            result.push(action.countryPoint)

            const currentMapName = action.countryPoint.map_name
            const currentList = result.filter(s => s.map_name === currentMapName)
            const showPoints = Object.assign({}, state.currentShowPoints)
            if (!showPoints[currentMapName]) {
                showPoints[currentMapName] = { top: null, bottom: null }
            }
            if (currentList.length >= 1) {
                if (!showPoints[currentMapName].top) {
                    showPoints[currentMapName].top = currentList[0].id
                }
            }
            if (currentList.length >= 2) {
                if (!showPoints[currentMapName].bottom) {
                    showPoints[currentMapName].bottom = currentList[1].id
                }
            }

            return {
                ...state,
                countryPoints: result,
                currentShowPoints: showPoints,
            }
        }
        case constants.RESET_COUNTRYLOCATION: {
            return {
                ...state,
                countryLocations: action.countryLocations,
            }
        }
        case constants.ADD_COUNTRYLOCATION: {
            const result = Object.assign([], state.countryLocations)
            result.push(action.countryLocation)
            return {
                ...state,
                countryLocations: result,
            }
        }
        default:
            return state
    }
}