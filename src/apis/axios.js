import axios from 'axios'

const get_request = (url) => {
    return axios.get(url)
}

const public_request = (query) => {
    return axios({
        url: process.env.REACT_APP_GRAPHQL_BACKEND, 
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
    const state = localStorage.getItem('reduxState')
    if (!state) return false
    const json = JSON.parse(state)
    if (!json.auth?.jwt) return false

    return axios({
        url: process.env.REACT_APP_GRAPHQL_BACKEND, 
        method: 'post',
        data: {
            query,
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': json.auth.jwt,
        }
    })
}

const request = {
    public: public_request, 
    credential: authorized_request,
    get: get_request,
}
export default request