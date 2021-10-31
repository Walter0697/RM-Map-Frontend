import constants from '../actions/constant'

export default function authReducer(state = {
    jwt: '',
    username: '',
}, action) {
    switch (action.type) {
        case constants.LOGIN:
            return {
                ...state,
                jwt: action.jwt,
                username: action.username,
            }
        default:
            return state
    }
}