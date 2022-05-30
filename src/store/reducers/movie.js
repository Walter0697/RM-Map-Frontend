import constants from '../actions/constant'

export default function movieReducer(state = {
    movies: [],
}, action) {
    switch(action.type) {
        case constants.RESET_MOVIES: {
            return {
                ...state,
                movies: action.movies,
            }
        }
        case constants.ADD_MOVIE: {
            const result = state.movies || []
            result.push(action.movie)
            return {
                ...state,
                movies: result,
            }
        }
        case constants.EDIT_MOVIE: {
            const before = state.movies || []
            let result = Object.assign([], before)
            const index = result.findIndex(s => s.id === action.movie.id)
            result[index] = action.movie
            return {
                ...state,
                movies: result,
            }
        }
        default:
            return state
    }
}