import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'

import backend from '../../constant/backend'

dayjs.extend(dayjsPluginUTC)

const canvasWidth = 720
const canvasHeight = 1280
const cardX = 48
const cardY = 48
const cardWidth = canvasWidth - cardX * 2
const cardHeight = canvasHeight - cardY * 2
const appGreen = '#b2d2a4'
const brandIconPath = '/logo192.png'

const preloadImage = async (imageLink) => {
    if (!imageLink) return null
    const img = new Image()
    img.src = imageLink
    img.crossOrigin = 'anonymous'
    await img.decode()
    return img
}

const getMarkerTypeIconPath = (schedule, eventtypes = []) => {
    const marker = schedule?.marker || schedule?.selected_marker || {}
    const markerType = marker?.type || marker?.marker_type || marker?.type_id
    if (!markerType || !Array.isArray(eventtypes) || eventtypes.length === 0) return ''

    const typeObj = eventtypes.find((et) => (
        et?.value === markerType
        || et?.id === markerType
        || `${et?.value}` === `${markerType}`
        || `${et?.id}` === `${markerType}`
        || `${et?.label}`.toLowerCase() === `${markerType}`.toLowerCase()
    ))
    return typeObj?.icon_path || ''
}

const getScheduleImagePath = (schedule, eventtypes = []) => {
    if (!schedule) return ''
    return (
        schedule.image_path
        || schedule.image_link
        || schedule.imageLink
        || schedule.movie?.image_path
        || schedule.movie?.image_link
        || schedule.movie?.imageLink
        || schedule.marker?.image_link
        || schedule.marker?.imageLink
        || schedule.marker?.image_path
        || schedule.marker?.imagePath
        || schedule.marker?.icon_path
        || schedule.selected_marker?.image_link
        || schedule.selected_marker?.imageLink
        || schedule.selected_marker?.image_path
        || schedule.selected_marker?.imagePath
        || schedule.selected_marker?.icon_path
        || getMarkerTypeIconPath(schedule, eventtypes)
        || ''
    )
}

const toScheduleImageSrc = (rawPath) => {
    if (!rawPath) return ''
    if (/^(https?:)?\/\//i.test(rawPath)) return rawPath
    if (`${rawPath}`.startsWith('/assets/') || `${rawPath}`.startsWith('/logo') || `${rawPath}`.startsWith('/favicon')) {
        return `${window.location.origin}${rawPath}`
    }

    const base = (backend.IMAGE_LINK || '').replace(/\/+$/, '')
    const normalized = `${rawPath}`
    const imageBaseWithSlash = `${base}/`
    if (normalized.startsWith(imageBaseWithSlash)) {
        return normalized
    }

    if (normalized.startsWith('/image/')) {
        const baseRoot = base.endsWith('/image') ? base.slice(0, -6) : ''
        return `${baseRoot}${normalized}`
    }

    if (normalized.startsWith('/')) {
        return `${base}${normalized}`
    }

    return `${base}/${normalized}`
}

const clipRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}

const fillWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines) => {
    if (!text) return y
    const words = `${text}`.trim().split(/\s+/)
    const lines = []
    let current = ''

    words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word
        if (ctx.measureText(candidate).width <= maxWidth) {
            current = candidate
            return
        }
        if (current) lines.push(current)
        current = word
    })

    if (current) lines.push(current)

    const limitedLines = typeof maxLines === 'number' ? lines.slice(0, maxLines) : lines
    limitedLines.forEach((line, index) => {
        const isLastVisibleLine = typeof maxLines === 'number' && index === limitedLines.length - 1 && lines.length > maxLines
        const displayLine = isLastVisibleLine ? `${line}...` : line
        ctx.fillText(displayLine, x, y + index * lineHeight)
    })

    return y + limitedLines.length * lineHeight
}

const getScheduleDescription = (schedule) => schedule?.description || schedule?.marker?.description || schedule?.selected_marker?.description || ''

const getScheduleAddress = (schedule) => schedule?.marker?.address || schedule?.selected_marker?.address || schedule?.address || ''

const getScheduleTitle = (schedule) => schedule?.label || schedule?.marker?.label || schedule?.selected_marker?.label || 'Untitled schedule'

const formatGapToNext = (current, next) => {
    if (!current?.selected_date || !next?.selected_date) return ''
    const currentTime = dayjs.utc(current.selected_date)
    const nextTime = dayjs.utc(next.selected_date)
    const totalMinutes = Math.max(0, nextTime.diff(currentTime, 'minute'))
    if (totalMinutes === 0) return 'next stop immediately'
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0 && minutes > 0) return `~${hours}h ${minutes}m to next stop`
    if (hours > 0) return `~${hours}h to next stop`
    return `~${minutes}m to next stop`
}

const buildSchedulePreviewImage = async (schedules = [], options = {}) => {
    const {
        eventtypes = [],
        dateKey = '',
    } = options

    const normalizedSchedules = Array.isArray(schedules) ? schedules.filter(Boolean) : []
    if (normalizedSchedules.length === 0) {
        throw new Error('No schedules available for image export')
    }

    const sortedSchedules = [...normalizedSchedules].sort((a, b) => dayjs.utc(a.selected_date).valueOf() - dayjs.utc(b.selected_date).valueOf())
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        throw new Error('canvas context unavailable')
    }

    ctx.fillStyle = appGreen
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    clipRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 36)
    ctx.save()
    ctx.fillStyle = appGreen
    ctx.shadowColor = 'rgba(38, 62, 108, 0.10)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 6
    ctx.fill()
    ctx.restore()

    const brandIcon = await preloadImage(toScheduleImageSrc(brandIconPath)).catch(() => null)

    let cursorY = cardY + 72
    ctx.fillStyle = '#455295'
    ctx.font = 'bold 58px sans-serif'
    const rangeText = dateKey
        ? dayjs.utc(`${dateKey}T00:00:00Z`).format('MMM D, YYYY')
        : dayjs.utc(sortedSchedules[0].selected_date).format('MMM D, YYYY')
    ctx.fillText(rangeText, cardX + 32, cursorY)

    if (brandIcon) {
        ctx.drawImage(brandIcon, cardX + cardWidth - 104, cardY + 24, 72, 72)
    }

    cursorY += 44
    ctx.fillStyle = '#4f5e79'
    ctx.font = '24px sans-serif'
    ctx.fillText('Schedule Share', cardX + 32, cursorY)

    cursorY += 44
    ctx.fillStyle = '#243559'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText(`${sortedSchedules.length} stops`, cardX + 32, cursorY)

    cursorY += 44

    const visibleSchedules = sortedSchedules.slice(0, 5)
    const mediaByIndex = await Promise.all(visibleSchedules.map(async (schedule) => {
        const photoPath = getScheduleImagePath(schedule, eventtypes)
        const iconPath = getMarkerTypeIconPath(schedule, eventtypes)
        const [ photo, typeIcon ] = await Promise.all([
            preloadImage(toScheduleImageSrc(photoPath)).catch(() => null),
            preloadImage(toScheduleImageSrc(iconPath)).catch(() => null),
        ])
        return { photo, typeIcon }
    }))

    visibleSchedules.forEach((schedule, index) => {
        const itemY = cursorY + index * 224
        const itemHeight = 142
        const itemX = cardX + 24
        const itemWidth = cardWidth - 48
        const mediaX = itemX + 18
        const mediaY = itemY + 18
        const mediaSize = 88
        const textX = mediaX + mediaSize + 20
        const timeX = itemX + itemWidth - 16
        const title = getScheduleTitle(schedule)
        const description = getScheduleDescription(schedule)
        const address = getScheduleAddress(schedule)
        const markerLabel = schedule.marker?.label || schedule.selected_marker?.label || schedule.movie?.title || ''
        const nextSchedule = visibleSchedules[index + 1] || null
        const gapText = formatGapToNext(schedule, nextSchedule)
        const { photo, typeIcon } = mediaByIndex[index] || {}

        ctx.fillStyle = 'rgba(245, 251, 240, 0.96)'
        clipRoundedRect(ctx, itemX, itemY, itemWidth, itemHeight, 24)
        ctx.fill()

        ctx.save()
        clipRoundedRect(ctx, mediaX, mediaY, mediaSize, mediaSize, 16)
        ctx.clip()
        if (photo) {
            const scale = Math.max(mediaSize / photo.width, mediaSize / photo.height)
            const drawWidth = photo.width * scale
            const drawHeight = photo.height * scale
            const drawX = mediaX + (mediaSize - drawWidth) / 2
            const drawY = mediaY + (mediaSize - drawHeight) / 2
            ctx.drawImage(photo, drawX, drawY, drawWidth, drawHeight)
        } else {
            const photoGradient = ctx.createLinearGradient(mediaX, mediaY, mediaX + mediaSize, mediaY + mediaSize)
            photoGradient.addColorStop(0, '#455295')
            photoGradient.addColorStop(1, '#48acdb')
            ctx.fillStyle = photoGradient
            ctx.fillRect(mediaX, mediaY, mediaSize, mediaSize)
        }
        ctx.restore()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(mediaX + mediaSize - 8, mediaY + 8, 18, 0, 2 * Math.PI, false)
        ctx.fill()
        if (typeIcon) {
            ctx.drawImage(typeIcon, mediaX + mediaSize - 24, mediaY - 8, 32, 32)
        } else {
            ctx.fillStyle = '#48acdb'
            ctx.beginPath()
            ctx.arc(mediaX + mediaSize - 8, mediaY + 8, 10, 0, 2 * Math.PI, false)
            ctx.fill()
        }

        ctx.fillStyle = '#22324d'
        ctx.font = 'bold 24px sans-serif'
        fillWrappedText(ctx, title, textX, itemY + 34, itemWidth - 248, 26, 1)

        ctx.fillStyle = '#56657f'
        ctx.font = '18px sans-serif'
        const subtitle = markerLabel && markerLabel !== title ? markerLabel : ''
        if (subtitle) {
            fillWrappedText(ctx, subtitle, textX, itemY + 64, itemWidth - 248, 20, 1)
        }
        if (description) {
            ctx.fillStyle = '#4f5e79'
            ctx.font = '16px sans-serif'
            fillWrappedText(ctx, description, textX, itemY + 88, itemWidth - 248, 18, 2)
        }
        if (address) {
            ctx.fillStyle = '#72829d'
            ctx.font = '15px sans-serif'
            fillWrappedText(ctx, address, textX, itemY + 124, itemWidth - 248, 17, 1)
        }

        const timeValue = schedule.selected_date ? dayjs.utc(schedule.selected_date).format('HH:mm') : '--:--'
        const dayValue = schedule.selected_date ? dayjs.utc(schedule.selected_date).format('ddd') : ''
        ctx.fillStyle = '#455295'
        ctx.font = 'bold 34px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(timeValue, timeX, itemY + 58)
        ctx.fillStyle = '#6b7b95'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(dayValue, timeX, itemY + 82)
        ctx.textAlign = 'left'

        if (gapText) {
            const gapY = itemY + itemHeight + 26
            const gapX = itemX + 56
            const gapWidth = itemWidth - 112
            const gapHeight = 34
            const connectorX = gapX + 18
            const nextItemY = cursorY + (index + 1) * 224
            const nextAnchorY = nextItemY + 8

            ctx.fillStyle = 'rgba(245, 251, 240, 0.92)'
            clipRoundedRect(ctx, gapX, gapY, gapWidth, gapHeight, 17)
            ctx.fill()

            ctx.fillStyle = '#455295'
            ctx.beginPath()
            ctx.arc(connectorX, gapY + 17, 5, 0, 2 * Math.PI, false)
            ctx.fill()
            ctx.strokeStyle = '#455295'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(connectorX, itemY + itemHeight + 6)
            ctx.lineTo(connectorX, gapY + 12)
            ctx.moveTo(connectorX, gapY + gapHeight - 12)
            ctx.lineTo(connectorX, nextAnchorY)
            ctx.stroke()

            ctx.fillStyle = '#455295'
            ctx.font = 'bold 16px sans-serif'
            ctx.fillText(gapText, gapX + 34, gapY + 22)
        }
    })

    if (sortedSchedules.length > 5) {
        ctx.fillStyle = '#56657f'
        ctx.font = '22px sans-serif'
        ctx.fillText(`+${sortedSchedules.length - 5} more scheduled stops`, cardX + 32, cardY + cardHeight - 82)
    }

    ctx.fillStyle = '#60708a'
    ctx.font = '18px sans-serif'
    ctx.fillText(`Generated ${dayjs().format('MMM D, YYYY HH:mm')}`, cardX + 32, cardY + cardHeight - 36)

    return canvas.toDataURL('image/png')
}

const generateSchedulePreviewImagesByDate = async (schedules = [], options = {}) => {
    const {
        eventtypes = [],
    } = options

    const normalizedSchedules = Array.isArray(schedules) ? schedules.filter(Boolean) : []
    if (normalizedSchedules.length === 0) {
        throw new Error('No schedules available for image export')
    }

    const groupedByDate = normalizedSchedules.reduce((result, schedule) => {
        const dateKey = schedule?.selected_date
            ? dayjs.utc(schedule.selected_date).format('YYYY-MM-DD')
            : 'unknown-date'
        if (!result[dateKey]) {
            result[dateKey] = []
        }
        result[dateKey].push(schedule)
        return result
    }, {})

    const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => dayjs.utc(a).valueOf() - dayjs.utc(b).valueOf())

    const generatedItems = []
    for (const dateKey of sortedDateKeys) {
        const dateSchedules = groupedByDate[dateKey]
        const imageUrl = await buildSchedulePreviewImage(dateSchedules, {
            eventtypes,
            dateKey,
        })

        generatedItems.push({
            dateKey,
            title: dayjs.utc(`${dateKey}T00:00:00Z`).format('MMM D, YYYY'),
            imageUrl,
            schedules: dateSchedules,
        })
    }

    return generatedItems
}

const schedulePreview = {
    generateSchedulePreviewImagesByDate,
}

export default schedulePreview
