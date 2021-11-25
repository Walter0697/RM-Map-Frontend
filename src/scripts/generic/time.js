import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

// convert to 2006-01-02T15:04:05Z07:00 format
const toRFC3339Format = (date) => {
    const dateOnly = dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ')
    return dateOnly
}

const toServerFormat = (date) => {
    const dateOnly = dayjs(date).format('YYYY-MM-DD HH:mm:ss+00')
    return dateOnly
}

const displayDateRange = (from_time, to_time) => {
    if (from_time && to_time) {
        const from_text = toLocalTime(from_time)
        const to_text = toLocalTime(to_time)
        return `${from_text} to ${to_text}`
    }
    if (from_time) {
        const from_text = toLocalTime(from_time)
        return `available at: ${from_text}`
    }
    if (to_time) {
        const to_text = toLocalTime(to_time)
        return `ends at ${to_text}`
    }
    return ''
}

const toLocalTime = (input, format = 'YYYY-MM-DD HH:mm') => {
    return dayjs.utc(input).format(format)
}

const time = {
    toRFC3339Format,
    displayDateRange,
    toServerFormat,
}

export default time