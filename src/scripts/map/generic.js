import tt from '@tomtom-international/web-sdk-maps'

const getCenter = (callback, fail_callback) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback, fail_callback)
    }
}

const getAddress = (addressObj) => {
    const availableDetails = addressObj.freeformAddress ? addressObj.freeformAddress : addressObj.streetName
    if (addressObj.streetNumber) {
        return `${addressObj.streetNumber} ${availableDetails}`
    }
    return availableDetails
}

const generic = {
    getCenter,
    getAddress,
}

export default generic