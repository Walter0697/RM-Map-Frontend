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
        case constants.EDIT_SCHEDULE: {
            const before = state.schedules || []
            let result = Object.assign([], before)
            let index = result.findIndex(s => s.id === action.schedule.id)
            result[index] = action.schedule
            return {
                ...state,
                schedules: result,
            }
        }
        case constants.REMOVE_SCHEDULE: {
            let result = state.schedules || []
            result = result.filter(s => s.id !== action.id)
            return {
                ...state, 
                schedules: result,
            }
        }
        case constants.UPDATE_SCHEDULES_STATUS: {
            const result = state.schedules || []
            for (let i = 0; i < action.schedules.length; i++) {
                let item = result.find(s => s.id === action.schedules[i].id)
                if (item) {
                    item.status = action.schedules[i].status
                }
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