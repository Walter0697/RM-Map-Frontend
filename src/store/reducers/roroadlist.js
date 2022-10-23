import constants from '../actions/constant'

export default function roroadListReducer(state = {
    roroadlists: [],
}, action) {
    switch(action.type) {
        case constants.RESET_ROROADLISTS: {
            return {
                ...state,
                roroadlists: action.roroadlists,
            }
        }
        case constants.ADD_ROROADLIST: {
            const result = state.roroadlists || []
            result.push(action.roroadlist)
            return {
                ...state,
                roroadlists: result,
            }
        }
        case constants.EDIT_ROROADLIST: {
            let before = state.roroadlists || []
            let result = Object.assign([], before)
            if (action.roroadlist.hidden) {
                result = result.filter(s => s.id !== action.roroadlist.id)
            } else {
                let index = result.findIndex(s => s.id === action.roroadlist.id)
                result[index] = action.roroadlist
            }
            return {
                ...state,
                roroadlists: result,
            }
        }
        case constants.MANAGE_ROROADLISTS: {
            let before = state.roroadlists || []
            let result = Object.assign([], before)
            for (let i = 0; i < action.roroadlists.length; i++) {
                const current = action.roroadlists[i]
                const existing = result.find(s => s.id === current.id)
                if (existing) {
                    if (current.hidden) {
                        result = result.filter(s => s.id !== current.id)
                    } else {
                        const index = result.findIndex(s => s.id === current.id)
                        for (const key in current) {
                            result[index][key] = current[key]
                        }
                    }
                } else {
                    result.push(current)
                }
            }
            return {
                ...state,
                roroadlists: result,
            }
        }
        default:
            return state
    }
}