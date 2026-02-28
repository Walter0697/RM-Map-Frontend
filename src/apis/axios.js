import axios from 'axios'
import backend from '../constant/backend'
import store from '../store'

const get_request = (url) => {
    return axios.get(url)
}

const public_request = (query) => {
    return axios({
        url: backend.GRAPHQL_BACKEND,
        method: 'post',
        data: {
            query,
        },
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

const authorized_request = (query) => {
    let token = store.getState()?.auth?.jwt || ''

    if (!token) {
        const state = localStorage.getItem('reduxState')
        if (!state) return false
        const json = JSON.parse(state)
        token = json.auth?.jwt || ''
    }

    if (!token) return false

    return axios({
        url: backend.GRAPHQL_BACKEND,
        method: 'post',
        data: {
            query,
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        }
    })
}

const nullable = (value) => {
    if (value) {
        return `"${value}"`
    }
    return null
}

const request = {
    public: public_request, 
    credential: authorized_request,
    get: get_request,
    nullable,
}
export default request
