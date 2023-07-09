import constants from '../actions/constant'
import dayjs from 'dayjs'

export default function homeReducer(state = {
    suggested: [],
    updated_date: '',
}, action) {
    switch(action.type) {
        case constants.RESET_HOME:
            return {
                ...state,
                suggested: action.featured,
                updated_date: dayjs().format('YYYY-MM-DD'),
            }
        default:
            return state
    }
}