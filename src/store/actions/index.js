import constants from './constant'

export const login = (jwt, username) => {
    return {
        type: constants.LOGIN,
        jwt,
        username,
    }
}

export const resetMarkers = (markers) => {
    return {
        type: constants.RESET_MARKERS,
        markers,
    }
}

export const addMarker = (marker) => {
    return {
        type: constants.ADD_MARKER,
        marker,
    }
}

export const updateMarkerFav = (marker) => {
    return {
        type: constants.UPDATE_MARKER_FAV,
        marker,
    }
}

const actions = {
    login,
    resetMarkers,
    updateMarkerFav,
    addMarker,
}

export default actions