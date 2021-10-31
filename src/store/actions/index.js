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

export const updateMarkerFav = (id, is_fav) => {
    return {
        type: constants.UPDATE_MARKER_FAV,
        id,
        is_fav,
    }
}

export const resetEventTypes = (eventtypes) => {
    return {
        type: constants.RESET_EVENTTYPES,
        eventtypes,
    }
}

const actions = {
    login,
    resetMarkers,
    updateMarkerFav,
    addMarker,
    resetEventTypes,
}

export default actions