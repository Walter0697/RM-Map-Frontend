import tt from '@tomtom-international/web-sdk-maps'

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

const generic = {
    getCenter,
    getAddress,
}

export default generic