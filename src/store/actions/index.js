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

export const updateReleaseList = (list) => {
    return {
        type: constants.UPDATE_RELEASE_LIST,
        list,
    }
}

export const updateReleaseSeen = (seen) =>{
    return {
        type: constants.UPDATE_RELEASE_SEEN,
        seen,
    }
}

export const updateReleaseLatest = (latest) => {
    return {
        type: constants.UPDATE_RELEASE_LATEST,
        latest,
    }
}

export const resetStations = (stations) => {
    return {
        type: constants.RESET_STATIONS,
        stations,
    }
}

export const updateStation = (identifier, map_name, active) => {
    return {
        type: constants.UPDATE_STATION,
        identifier,
        map_name,
        active,
    }
}

export const setStationMapShown = (map_type, enable) => {
    return {
        type: constants.SET_STATION_IN_MAP,
        map_type,
        enable,
    }
}

export const updateFilter = (value) => {
    return {
        type: constants.UPDATE_FILTER,
        value,
    }
}

export const updateHashtag = (value) => {
    return {
        type: constants.UPDATE_HASHTAG,
        value,
    }
}

export const resetMovies = (movies) => {
    return {
        type: constants.RESET_MOVIES,
        movies,
    }
}

export const addMovie = (movie) => {
    return {
        type: constants.ADD_MOVIE,
        movie,
    }
}

export const updateMovie = (movie) => {
    return {
        type: constants.EDIT_MOVIE,
        movie,
    }
}

export const resetRoroadLists = (roroadlists) => {
    return {
        type: constants.RESET_ROROADLISTS,
        roroadlists,
    }
}

export const addRoroadList = (roroadlist) => {
    return {
        type: constants.ADD_ROROADLIST,
        roroadlist,
    }
}

export const updateRoroadlist = (roroadlist) => {
    return {
        type: constants.EDIT_ROROADLIST,
        roroadlist,
    }
}

export const manageMultipleRoroadLists = (roroadlists) => {
    return {
        type: constants.MANAGE_ROROADLISTS,
        roroadlists,
    }
}

export const resetCountryCodes = (countryCodes) => {
    return {
        type: constants.RESET_COUNTRYCODE,
        countryCodes,
    }
}

export const resetCountryParts = (countryparts) => {
    return {
        type: constants.RESET_COUNTRYPARTS,
        countryparts,
    }
}

export const resetFilterCountry = (filtered) => {
    return {
        type: constants.RESET_FILTERCOUNTRY,
        filtered,
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
    updateReleaseList,
    updateReleaseLatest,
    updateReleaseSeen,
    resetStations,
    updateStation,
    setStationMapShown,
    updateFilter,
    updateHashtag,
    resetMovies,
    addMovie,
    updateMovie,
    resetRoroadLists,
    addRoroadList,
    updateRoroadlist,
    manageMultipleRoroadLists,
    resetCountryCodes,
    resetCountryParts,
    resetFilterCountry,
}

export default actions