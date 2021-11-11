const getPinType = (marker) => {
    if (marker.is_hurry) return 'hurry'
    if (marker.is_fav) return 'favourite'

    return 'regular'
}

const pins = {
    getPinType,
}

export default pins