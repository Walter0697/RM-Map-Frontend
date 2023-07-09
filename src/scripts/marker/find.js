import constants from '../../constant'
import generic from '../generic'
import text from './text'
import dayjs from 'dayjs'

const featureListNum = 4

const getActiveMarker = (markers) => {
    // by status
    const byStatus = markers.filter(s => s.status === '' || s.status === constants.identifiers.markerStatusScheduled)

    // ignore expired markers
    const now = dayjs().add(-1, 'day')
    const nonExpired = byStatus.filter(s => !s.to_time || dayjs(s.to_time).isAfter(now))

    return nonExpired
}

const getSuggestMarker = (markers, eventtypes) => {
    // only empty status can do
    const byStatus = markers.filter(s => s.status === '')

    // ignore expired markers
    const now = dayjs().add(-1, 'day')
    const nonExpired = byStatus.filter(s => !s.to_time || dayjs(s.to_time).isAfter(now))

    // no hidden marker will be suggested
    const hiddenEventTypes = eventtypes.filter(s => s.hidden).map(s => s.value)
    const nonHidden = nonExpired.filter(s => !hiddenEventTypes.includes(s.type))

    return nonHidden
}

const getFeaturedByType = (markers, type) => {
    switch(type) {
        case constants.identifiers.featureMarkerUpcoming:
            return upcomingEnd(markers)
        case constants.identifiers.featureMarkerLongTimeCreated:
            return longTimeCreated(markers)
        case constants.identifiers.featureMarkerFeelingLucky:
            return feelingLucky(markers)
        case constants.identifiers.featureMarkerShortTime:
            return shortTime(markers)
        case constants.identifiers.featureMarkerRestaurant:
            return restaurantType(markers)
        case constants.identifiers.featureMarkerExpensive:
            return expensiveSpend(markers)
        default:
            return null
    }
    return null
}

const getFeaturedListByType = (markers, type) => {
    const featured_list = []
    const current_list = []
    for (let i = 0; i < featureListNum; i++) {
        const featured = getFeaturedByType(markers, type)
        if (featured && !current_list.includes(featured.marker.id)) {
            featured_list.push(featured)
            current_list.push(featured.marker.id)
        }
    }

    return featured_list
}

const getFeaturedList = (markers) => {
    const featured_list = []
    const current_list = []

    const ue = upcomingEnd(markers)
    if (ue) {
        featured_list.push(ue)
        current_list.push(ue.marker.id)
    }
    
    const lt = longTimeCreated(markers)
    if (lt && !current_list.includes(lt.marker.id)) {
        featured_list.push(lt)
        current_list.push(lt.marker.id)
    }

    const fl = feelingLucky(markers)
    if (fl && !current_list.includes(fl.marker.id)) {
        featured_list.push(fl)
        current_list.push(fl.marker.id)
    }

    const st = shortTime(markers)
    if (st && !current_list.includes(st.marker.id)) {
        featured_list.push(st)
        current_list.push(st.marker.id)
    }

    const rt = restaurantType(markers)
    if (rt && !current_list.includes(rt.marker.id)) {
        featured_list.push(rt)
        current_list.push(rt.marker.id)
    }

    return featured_list
}

const upcomingEnd = (markers) => {
    const hasToTimeList = markers.filter(s => s.to_time !== null)
    if (hasToTimeList.length === 0) return null

    const sorted = hasToTimeList.sort((a, b) => {
        if (dayjs(a.to_time).isAfter(dayjs(b.to_time))) {
            return 1
        }
        return -1
    })
 
    const allowed_index = Math.ceil(sorted.length * 0.1)
    const index = generic.math.rand(allowed_index)

    return {
        type: constants.identifiers.featureMarkerUpcoming,
        label: text.feature_text(constants.identifiers.featureMarkerUpcoming),
        marker: sorted[index]
    }
}

const longTimeCreated = (markers) => {
    if (markers.length === 0) return null

    const sorted = markers.sort((a, b) => {
        if (dayjs(a.created_at).isAfter(dayjs(b.created_at))) {
            return 1
        }
        return -1
    })
 
    const allowed_index = Math.ceil(sorted.length * 0.1)
    const index = generic.math.rand(allowed_index)

    return {
        type: constants.identifiers.featureMarkerLongTimeCreated,
        label: text.feature_text(constants.identifiers.featureMarkerLongTimeCreated),
        marker: sorted[index]
    }
}

const feelingLucky = (markers) => {
    if (markers.length === 0) return null
    
    const index = generic.math.rand(markers.length)
    return {
        type: constants.identifiers.featureMarkerFeelingLucky,
        label: text.feature_text(constants.identifiers.featureMarkerFeelingLucky),
        marker: markers[index]
    }
}

const shortTime = (markers) => {
    const filtered = markers.filter(s => s.estimate_time === constants.identifiers.estimateTimeShort)

    if (filtered.length === 0) return null

    const index = generic.math.rand(filtered.length)

    return {
        type: constants.identifiers.featureMarkerShortTime,
        label: text.feature_text(constants.identifiers.featureMarkerShortTime),
        marker: filtered[index],
    }
}

const restaurantType = (markers) => {
    const filtered = markers.filter(s => s.type === constants.identifiers.restaurantTypeIdentifier)

    if (filtered.length === 0) return null

    const index = generic.math.rand(filtered.length)

    return {
        type: constants.identifiers.featureMarkerRestaurant,
        label: text.feature_text(constants.identifiers.featureMarkerRestaurant),
        marker: filtered[index],
    }
}

const expensiveSpend = (markers) => {
    const filtered = markers.filter(s => s.type === 'expensive')
    
    if (filtered.length === 0) return null

    const index = generic.math.rand(filtered.length)

    return {
        type: constants.identifiers.featureMarkerExpensive,
        label: text.feature_text(constants.identifiers.featureMarkerExpensive),
        marker: filtered[index],
    }
}

const find = {
    active: getActiveMarker,
    suggest: getSuggestMarker,
    feature_list: getFeaturedList,
    feature_list_by_type: getFeaturedListByType,
    upcomingEnd,
    longTimeCreated,
    feelingLucky,
    shortTime,
    restaurantType,
    expensiveSpend,

}

export default find