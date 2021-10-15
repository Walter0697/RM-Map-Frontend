import constants from "../actions/constant";

export default function authReducer(state = {
    jwt: '',
}, action) {
    switch (action.type) {
        case constants.LOGIN:
            return {
                jwt: action.jwt
            }
        default:
            return state
    }
}