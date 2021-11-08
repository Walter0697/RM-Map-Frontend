import dayjs from 'dayjs'

const getPinType = (marker) => {
    if (marker.to_time) {
        const fivedays = dayjs(marker.to_time).add(5, 'day')
        if (fivedays.isAfter(dayjs(), 'day')) {
            return 'hurry'
        }
    }

    if (marker.is_fav) return 'favourite'

    return 'regular'
}

const pins = {
    getPinType,
}

export default pins