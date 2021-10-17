import request from './axios'

const search = (searchWord, lon, lat, limit = 10, radius = 2000) => {
    const baseUrl = 'https://api.tomtom.com/search/2/poiSearch'
    const queryString = `limit=${limit}&lat=${lat}&lon=${lon}&radius=${radius}&key=${process.env.REACT_APP_MAP_APIKEY}`
    return request.get(`${baseUrl}/${searchWord}.json?${queryString}`)
}

const maps = {
    search,
}

export default maps