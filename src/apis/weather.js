import axios from 'axios'
import backend from '../constant/backend'

const planning = (query) => {
    const base = backend.withBasePath('weather/planning')
    return axios.get(base, {
        params: query,
    })
}

const reportOverlayEvent = (payload) => {
    const base = backend.withBasePath('weather/overlay-events')
    return axios.post(base, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

const weather = {
    planning,
    reportOverlayEvent,
}

export default weather
