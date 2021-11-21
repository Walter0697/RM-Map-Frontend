import generic from '../generic'
import dayjs from 'dayjs'

// IDEA:
// short period of time
// with the same type
// expensive or not

const upcomingEnd = (markers) => {
    const hasToTimeList = markers.filter(s => s.to_time !== null)

    const sorted = hasToTimeList.sort((a, b) => {
        if (dayjs(a.to_time).isAfter(dayjs(b.to_time))) {
            return 1
        }
        return -1
    })

    if (sorted.length === 0) return null
 
    const allowed_index = Math.ceil(sorted.length * 0.1)
    const index = generic.math.rand(allowed_index)

    return sorted[index]
}

const longTimeCreated = (markers) => {
    const sorted = markers.sort((a, b) => {
        if (dayjs(a.created_at).isAfter(dayjs(b.created_at))) {
            return 1
        }
        return -1
    })

    if (sorted.length === 0) return null
 
    const allowed_index = Math.ceil(sorted.length * 0.1)
    const index = generic.math.rand(allowed_index)

    return sorted[index]
}

const feelingLucky = (markers) => {
    const index = generic.math.rand(markers.length)
    return markers[index]
}

const find = {
    upcomingEnd,
    longTimeCreated,
    feelingLucky,
}

export default find