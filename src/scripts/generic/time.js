import dayjs from 'dayjs'

// convert to 2006-01-02T15:04:05Z07:00 format
const toRFC3339Format = (date) => {
    const dateOnly = dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ')
    return dateOnly
}

const time = {
    toRFC3339Format,
}

export default time