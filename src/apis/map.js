import request from './axios'

const search = (searchWord, lon, lat, limit = 10, radius = 5000) => {
    const baseUrl = 'https://api.tomtom.com/search/2/poiSearch'
    const queryString = `limit=${limit}&lat=${lat}&lon=${lon}&radius=${radius}&key=${process.env.REACT_APP_MAP_APIKEY}`
    return request.get(`${baseUrl}/${searchWord}.json?${queryString}`)
}

const streetname = (lon, lat) => {
    const baseUrl = 'https://api.tomtom.com/search/2/reverseGeocode'
    const queryString = `key=${process.env.REACT_APP_MAP_APIKEY}`
    return request.get(`${baseUrl}/${lat},${lon}.json?${queryString}`)
}

const geocode = (streetNum, streetName, country = 'HK', limit = 10) => {
    const baseUrl = 'https://api.tomtom.com/search/2/structuredGeocode.json'
    const queryString = `streetNumber=${streetNum}&streetName=${streetName}&countrySet=${country}&limit=${limit}&key=${process.env.REACT_APP_MAP_APIKEY}`
    return request.get(`${baseUrl}?${queryString}`)
}

const maps = {
    search,
    streetname,
    geocode,
}

export default maps