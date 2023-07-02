import constants from '../actions/constant'
import _ from 'lodash'

export default function countryReducer(state = {
    countryPoints: [],
    countryLocations: [],
    currentShowPoints: {},
}, action) {
    switch(action.type) {
        case constants.RESET_COUNTRYPOINT: {
            const byMapName = {}
            action.countryPoints.forEach(point => {
                if (!byMapName[point.map_name]) {
                    byMapName[point.map_name] = []
                }
                byMapName[point.map_name].push(point)
            })

            const showPoints = _.cloneDeep(state.currentShowPoints) ?? {}
            
            for (const mapName in byMapName) {
                const list = byMapName[mapName]
                if (!showPoints[mapName]) {
                    if (showPoints[mapName] && showPoints[mapName].top && showPoints[mapName].bottom) {
                        continue
                    }
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
            }
            return {
                ...state,
                countryPoints: action.countryPoints,
                currentShowPoints: showPoints,
            }
        }
        case constants.RESET_COUNTRYLOCATION: {
            return {
                ...state,
                countryLocations: action.countryLocations,
            }
        }
        default:
            return state
    }
}