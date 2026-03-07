import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

const getTodaySchedule = (schedules) => {
    if (!schedules) return []
    
    const now = dayjs().format('YYYY-MM-DD')
    return schedules.filter(s => dayjs(s.selected_date).format('YYYY-MM-DD') === now)
}

const getUpcomingSchedules = (schedules) => {
    if (!schedules) return []

    const now = dayjs()
    const nowStr = now.format('YYYY-MM-DD')
    return schedules.filter(s => dayjs(s.selected_date).format('YYYY-MM-DD') !== nowStr && dayjs(s.selected_date).isAfter(now))
}

const getDisplayImagePath = (schedule, eventtypes) => {
    if (!schedule) return ''

    if (schedule.movie?.image_path) return schedule.movie.image_path
    if (schedule.marker?.image_link) return schedule.marker.image_link

    if (schedule.marker?.type) {
        const typeObj = eventtypes.find(et => et.value === schedule.marker.type)
        if (typeObj?.icon_path) return typeObj.icon_path
    }

    return ''
}

const getTodayScheduleWithImage = (schedules, eventtypes) => {
    if (!schedules) return []

    const today_list = getTodaySchedule(schedules)
    return today_list
        .map((s) => {
            const imagePath = getDisplayImagePath(s, eventtypes)
            if (!imagePath) return null
            return {
                ...s,
                image_path: imagePath,
            }
        })
        .filter(Boolean)
    // const included_image_list = today_list.filter(s => s.marker?.image_link)

    // if (included_image_list.length === 0) {
    //     let result = []
    //     today_list.forEach(s => {
    //         if (s.marker) {
    //             if (!s.marker.image_link) {
    //                 if (s.marker.type) {
    //                     const typeObj = eventtypes.find(et => et.value === s.marker.type)
    //                     if (typeObj) {
    //                         s.marker.image_link = typeObj.icon_path
    //                         result.push(s)
    //                     }
    //                 }
    //             } else {
    //                 result.push(s)
    //             }
    //         }
    //     })
    //     return result
    // }

    // return included_image_list
}

const getScheuldeWithImage = (schedules, eventtypes) => {
    if (!schedules) return []

    return schedules
        .map((s) => {
            const imagePath = getDisplayImagePath(s, eventtypes)
            if (!imagePath) return null
            return {
                ...s,
                image_path: imagePath,
            }
        })
        .filter(Boolean)
    // const included_image_list = schedules.filter(s => s.marker?.image_link)

    // if (included_image_list.length === 0) {
    //     let result = []
    //     schedules.forEach(s => {
    //         if (s.marker) {
    //             if (!s.marker.image_link) {
    //                 if (s.marker.type) {
    //                     const typeObj = eventtypes.find(et => et.value === s.marker.type)
    //                     if (typeObj) {
    //                         s.marker.image_link = typeObj.icon_path
    //                         result.push(s)
    //                     }
    //                 }
    //             } else {
    //                 result.push(s)
    //             }
    //         }
    //     })
    //     return result
    // }

    //return included_image_list
}

const schedules = {
    get_today: getTodaySchedule,
    get_upcoming: getUpcomingSchedules,
    get_today_image: getTodayScheduleWithImage,
    get_schedule_image: getScheuldeWithImage,
}

export default schedules
