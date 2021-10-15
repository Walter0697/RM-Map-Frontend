import tt from '@tomtom-international/web-sdk-maps'

const getCenter = (callback, fail_callback) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback, fail_callback)
    }
}

const generic = {
    getCenter,
}

export default generic