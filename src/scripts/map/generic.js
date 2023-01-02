const getCenter = (callback, fail_callback) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback, fail_callback)
    }
}

const getAddress = (addressObj) => {
    if (addressObj.freeformAddress) {
        return addressObj.freeformAddress
    }
    const simpleStreetName = addressObj.streetNumber ? `${addressObj.streetNumber} ${addressObj.streetName}` : addressObj.streetName
    return simpleStreetName
}

const getCenterFromMarkerList = (markers) => {
    let lat_total = 0
    let lon_total = 0
    for (let i = 0; i < markers.length; i++) {
        lat_total += markers[i].latitude
        lon_total += markers[i].longitude
    }

    return {
        latitude: lat_total / markers.length,
        longitude: lon_total / markers.length,
    }
}

const generic = {
    getCenter,
    getAddress,
    getCenterFromMarkerList,
}

export default generic