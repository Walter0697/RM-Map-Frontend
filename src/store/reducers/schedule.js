import constants from '../actions/constant'

export default function scheduleReducer(state = {
    schedules: [],
}, action) {
    switch(action.type) {
        case constants.RESET_SCHEDULES: {
            return {
                ...state, 
                schedules: action.schedules,
            }
        }
        case constants.ADD_SCHEDULE: {
            const result = state.schedules || []
            result.push(action.schedule)
            return {
                ...state,
                schedules: result,
            }
        }
        default:
            return state
    }
}