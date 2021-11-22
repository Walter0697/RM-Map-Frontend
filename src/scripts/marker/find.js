import generic from '../generic'
import text from './text'
import dayjs from 'dayjs'

const getFeaturedList = (markers, ignored_featured) => {
    let featured_list = []
    const ue = upcomingEnd(markers)
    if (ue && !ignored_featured.includes(ue.type)) featured_list.push(ue)
    const lt = longTimeCreated(markers)
    if (lt && !ignored_featured.includes(lt.type))  featured_list.push(lt)
    const fl = feelingLucky(markers)
    if (fl && !ignored_featured.includes(fl.type)) featured_list.push(fl)
    const st = shortTime(markers)
    if (st && !ignored_featured.includes(st.type))  featured_list.push(st)
    const rt = restaurantType(markers)
    if (rt && !ignored_featured.includes(rt.type))  featured_list.push(rt)
    const es = expensiveSpend(markers)
    if (es && !ignored_featured.includes(es.type)) featured_list.push(es)

    return featured_list
}

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

    return {
        type: 'upcoming',
        label: text.feature_text('upcoming'),
        marker: sorted[index]
    }
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

    return {
        type: 'longtime',
        label: text.feature_text('longtime'),
        marker: sorted[index]
    }
}

const feelingLucky = (markers) => {
    if (markers.length === 0) return null
    
    const index = generic.math.rand(markers.length)
    return {
        type: 'lucky',
        label: text.feature_text('lucky'),
        marker: markers[index]
    }
}

const shortTime = (markers) => {
    const filtered = markers.filter(s => s.estimate_time === 'short')

    if (filtered.length === 0) return null

    const index = generic.math.rand(filtered.length)

    return {
        type: 'shorttime',
        label: text.feature_text('shorttime'),
        marker: filtered[index],
    }
}

// MIGHT CHANGE since marker type is dynamic
const restaurantType = (markers) => {
    const filtered = markers.filter(s => s.type === 'restaurant')

    if (filtered.length === 0) return null

    const index = generic.math.rand(filtered.length)

    return {
        type: 'restaurant',
        label: text.feature_text('restaurant'),
        marker: filtered[index],
    }
}

const expensiveSpend = (markers) => {
    const filtered = markers.filter(s => s.type === 'expensive')
    
    if (filtered.length === 0) return null

    const index = generic.math.rand(filtered.length)

    return {
        type: 'expensive',
        label: text.feature_text('expensive'),
        marker: filtered[index],
    }
}

const find = {
    feature_list: getFeaturedList,
    upcomingEnd,
    longTimeCreated,
    feelingLucky,
    shortTime,
    restaurantType,
    expensiveSpend,

}

export default find