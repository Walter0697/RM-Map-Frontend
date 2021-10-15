import tt from '@tomtom-international/web-sdk-maps'

const getCenter = (callback) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback)
    }
}

const generic = {
    getCenter,
}

export default generic