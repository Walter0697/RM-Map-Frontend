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
        case constants.UPDATE_SCHEDULE_STATUS: {
            const result = state.schedules
            for (let i = 0; i < action.schedules.length; i++) {
                let item = result.find(s => s.id === action.schedules[i].id)
                item.status = action.schedules[i].status
            }
            return {
                ...state,
                schedules: result,
            }
        }
        default:
            return state
    }
}