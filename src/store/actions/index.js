import constants from './constant'

export const login = (jwt) => {
    return {
        type: constants.LOGIN,
        jwt,
    }
}

const actions = {
    login,
}

export default actions