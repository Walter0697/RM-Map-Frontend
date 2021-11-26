import constants from './constant'

export const login = (jwt, username) => {
    return {
        type: constants.LOGIN,
        jwt,
        username,
    }
}

export const logout = () => {
    return {
        type: constants.LOGOUT,
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

export const resetMappins = (mappins) => {
    return {
        type: constants.RESET_MAPPINS,
        mappins,
    }
}

export const resetSchedules = (schedules) => {
    return {
        type: constants.RESET_SCHEDULES,
        schedules,
    }
}

export const addSchedule = (schedule) => {
    return {
        type: constants.ADD_SCHEDULE,
        schedule,
    }
}

export const updateMarkerStatus = (marker) => {
    return {
        type: constants.UPDATE_MARKER_STATUS,
        marker,
    }
}

export const updateMarkersStatus = (markers) => {
    return {
        type: constants.UPDATE_MARKERS_STATUS,
        markers,
    }
}

export const updateSchedulesStatus = (schedules) => {
    return {
        type: constants.UPDATE_SCHEDULES_STATUS,
        schedules,
    }
}

export const resetHomeFeatured = (featured) => {
    return {
        type: constants.RESET_HOME,
        featured,
    }
}

export const revokeMarker = (marker) => {
    return {
        type: constants.REVOKE_MARKER,
        marker,
    }
}

export const editMarker = (marker) => {
    return {
        type: constants.EDIT_MARKER,
        marker,
    }
}

export const removeMarker = (id) => {
    return {
        type: constants.REMOVE_MARKER,
        id,
    }
}

export const editSchedule = (schedule) => {
    return {
        type: constants.EDIT_SCHEDULE,
        schedule,
    }
}

export const removeSchedule = (id) => {
    return {
        type: constants.REMOVE_SCHEDULE,
        id,
    }
}

const actions = {
    login,
    logout,
    resetMarkers,
    updateMarkerFav,
    addMarker,
    resetEventTypes,
    resetMappins,
    resetSchedules,
    addSchedule,
    updateMarkerStatus,
    updateMarkersStatus,
    updateSchedulesStatus,
    resetHomeFeatured,
    revokeMarker,
    editMarker,
    removeMarker,
    editSchedule,
    removeSchedule,
}

export default actions