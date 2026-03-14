import React, { useEffect, useMemo, useState } from 'react'
import {
    Box,
    CircularProgress,
    Popover,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import OpacityIcon from '@mui/icons-material/Opacity'
import SensorsIcon from '@mui/icons-material/Sensors'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import dayjs from 'dayjs'

import apis from '../../apis'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const WEATHER_PREVIEW_CACHE_TTL_MS = 3 * 60 * 1000
const WEATHER_FORECAST_MAX_DAYS = 7
const weatherPreviewCache = new Map()

const formatForecastTime = (value) => {
    if (!value) return ''
    const parsed = dayjs(value)
    if (!parsed.isValid()) return ''
    return parsed.format('YYYY-MM-DD HH:mm')
}

const conditionLabel = (type = '') => {
    const normalized = `${type}`.trim().toLowerCase()
    if (!normalized) return 'Clear'
    if (normalized === 'none') return 'Clear'
    if (normalized === 'rain') return 'Rain'
    if (normalized === 'snow') return 'Snow'
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const statusLabel = (status = '') => {
    const normalized = `${status}`.trim().toLowerCase()
    if (normalized === 'fresh') return 'Fresh'
    if (normalized === 'stale') return 'Stale'
    if (normalized === 'unavailable') return 'Unavailable'
    if (normalized === 'loading') return 'Loading'
    return 'Fresh'
}

const sourceMeta = (source = '') => {
    const normalized = `${source}`.trim().toLowerCase()
    if (normalized === 'cache') {
        return {
            label: 'Source: Cache',
            color: '#5a6c82',
            Icon: StorageOutlinedIcon,
        }
    }
    if (normalized === 'provider') {
        return {
            label: 'Source: Provider',
            color: '#3a7a2e',
            Icon: SensorsIcon,
        }
    }
    return {
        label: 'Source: Degraded',
        color: '#a14f08',
        Icon: CloudOffOutlinedIcon,
    }
}

const normalizeUnavailableMessage = (value = '') => {
    const raw = `${value}`.trim()
    const lower = raw.toLowerCase()
    if (!raw) return ''
    if (
        lower.includes('forecast day offset too large')
        || lower.includes('forecast horizon')
        || lower.includes('forecast window too large')
    ) {
        return `Weather forecast supports up to ${WEATHER_FORECAST_MAX_DAYS} days ahead.`
    }
    if (lower.includes('invalid weather viewport input')) {
        return `Weather preview is unavailable for the selected forecast range (max ${WEATHER_FORECAST_MAX_DAYS} days).`
    }
    return raw
}

const toWeatherPreviewCacheKey = (marker, selected) => {
    const lat = Number(marker?.latitude)
    const lon = Number(marker?.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lon) || !selected?.isValid?.()) return ''
    return `${lat.toFixed(5)}:${lon.toFixed(5)}:${selected.startOf('day').format('YYYY-MM-DD')}`
}

const getCachedWeatherPreview = (key) => {
    if (!key) return null
    const item = weatherPreviewCache.get(key)
    if (!item) return null
    if (Date.now() - item.storedAt > WEATHER_PREVIEW_CACHE_TTL_MS) {
        weatherPreviewCache.delete(key)
        return null
    }
    return item.data
}

const setCachedWeatherPreview = (key, data) => {
    if (!key || !data) return
    weatherPreviewCache.set(key, {
        data,
        storedAt: Date.now(),
    })
}

function ScheduleWeatherPreview({
    marker,
    selectedTime,
}) {
    const [ loading, setLoading ] = useState(false)
    const [ fetchError, setFetchError ] = useState('')
    const [ weatherData, setWeatherData ] = useState(null)
    const [ weatherDetailAnchor, setWeatherDetailAnchor ] = useState(null)

    const markerCoordinateReady = useMemo(() => {
        if (!marker) return false
        const lat = Number(marker.latitude)
        const lon = Number(marker.longitude)
        return !Number.isNaN(lat) && !Number.isNaN(lon)
    }, [marker])

    useEffect(() => {
        let cancelled = false
        let timer = null

        if (!selectedTime || !markerCoordinateReady) {
            setLoading(false)
            setFetchError('')
            setWeatherData(null)
            return () => {}
        }

        const selected = dayjs(selectedTime)
        if (!selected.isValid()) {
            setLoading(false)
            setFetchError('Invalid selected time')
            setWeatherData(null)
            return () => {}
        }

        const offsetDays = clamp(selected.startOf('day').diff(dayjs().startOf('day'), 'day'), 0, 16)
        if (offsetDays > WEATHER_FORECAST_MAX_DAYS) {
            setLoading(false)
            setWeatherData(null)
            setFetchError(`Weather forecast supports up to ${WEATHER_FORECAST_MAX_DAYS} days ahead.`)
            return () => {}
        }
        const query = {
            min_lat: Number(marker.latitude).toFixed(5),
            max_lat: Number(marker.latitude).toFixed(5),
            min_lon: Number(marker.longitude).toFixed(5),
            max_lon: Number(marker.longitude).toFixed(5),
            center_lat: Number(marker.latitude).toFixed(5),
            center_lon: Number(marker.longitude).toFixed(5),
            zoom: 13,
            forecast_window_h: clamp((offsetDays + 1) * 24, 24, 16 * 24),
            forecast_day_offset: offsetDays,
        }
        const cacheKey = toWeatherPreviewCacheKey(marker, selected)
        const cached = getCachedWeatherPreview(cacheKey)
        if (cached) {
            setLoading(false)
            setFetchError('')
            setWeatherData(cached)
            return () => {}
        }

        timer = window.setTimeout(async () => {
            try {
                setLoading(true)
                setFetchError('')
                const response = await apis.weather.planning(query)
                if (cancelled) return
                const data = response?.data || null
                setWeatherData(data)
                setCachedWeatherPreview(cacheKey, data)
                setLoading(false)
            } catch (error) {
                if (cancelled) return
                setLoading(false)
                setWeatherData(null)
                setFetchError(error?.message || 'Weather request failed')
            }
        }, 250)

        return () => {
            cancelled = true
            if (timer) window.clearTimeout(timer)
        }
    }, [selectedTime, markerCoordinateReady, marker])

    if (!markerCoordinateReady) {
        return (
            <Typography variant='body2' sx={{ color: '#607286' }}>
                Weather preview unavailable until a marker location is selected.
            </Typography>
        )
    }

    const topItem = weatherData?.items?.[0] || null
    const freshness = weatherData?.freshness || {}
    const unavailableMessage = normalizeUnavailableMessage(weatherData?.error_message || fetchError)
    const forecastAt = topItem?.forecast_timestamp || ''
    const precipitationType = `${topItem?.precipitation_type || 'none'}`.trim().toLowerCase()
    const resolvedCondition = unavailableMessage ? 'unavailable' : (precipitationType || 'none')
    const resolvedStatus = unavailableMessage
        ? 'unavailable'
        : (freshness?.status || (loading ? 'loading' : 'fresh'))
    const WeatherIcon = (() => {
        if (resolvedStatus === 'unavailable') return CloudOffOutlinedIcon
        if (resolvedStatus === 'loading') return HelpOutlineOutlinedIcon
        if (resolvedCondition === 'snow') return AcUnitIcon
        if (resolvedCondition === 'rain') return OpacityIcon
        return WbSunnyOutlinedIcon
    })()
    const iconColor = resolvedStatus === 'unavailable'
        ? '#9e2e1b'
        : resolvedCondition === 'snow'
            ? '#3d8bda'
            : resolvedCondition === 'rain'
                ? '#2962b8'
                : '#cf8a05'
    const sourceValue = freshness?.source || weatherData?.provider || 'N/A'
    const sourceInfo = sourceMeta(sourceValue)
    const weatherDetailOpen = !!weatherDetailAnchor

    return (
        <Box
            sx={{
                border: '1px solid #d7e3f4',
                borderRadius: '8px',
                backgroundColor: '#f8fbff',
                px: 1,
                py: 0.75,
                position: 'relative',
            }}
        >
            <Stack
                direction='row'
                spacing={0.75}
                alignItems='center'
                onClick={(event) => setWeatherDetailAnchor(event.currentTarget)}
                sx={{ cursor: 'pointer' }}
            >
                <WeatherIcon sx={{ color: iconColor, fontSize: 18 }} />
                <Typography variant='caption' sx={{ color: '#2c3f55', fontWeight: 700 }}>
                    Weather Preview
                </Typography>
                {loading ? <CircularProgress size={12} /> : null}
                <Typography variant='caption' sx={{ color: '#53657b', ml: 'auto' }}>
                    {conditionLabel(resolvedCondition)} / {statusLabel(resolvedStatus)}
                </Typography>
            </Stack>
            {unavailableMessage ? (
                <Typography variant='caption' sx={{ color: '#ab3d2a', display: 'block', mt: 0.5 }}>
                    {unavailableMessage}
                </Typography>
            ) : (
                <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                    <Typography variant='caption' sx={{ color: '#607286', display: 'block' }}>
                        Forecast at: {formatForecastTime(forecastAt) || 'N/A'}
                    </Typography>
                </Stack>
            )}
            <Typography variant='caption' sx={{ color: '#6f8096', display: 'block', mt: 0.5 }}>
                Weather snapshot is finalized on save.
            </Typography>
            <Tooltip title={sourceInfo.label} placement='top'>
                <Box
                    sx={{
                        position: 'absolute',
                        right: 6,
                        bottom: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                    }}
                >
                    <sourceInfo.Icon sx={{ fontSize: 14, color: sourceInfo.color }} />
                </Box>
            </Tooltip>
            <Popover
                open={weatherDetailOpen}
                anchorEl={weatherDetailAnchor}
                onClose={() => setWeatherDetailAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        border: '1px solid #d9e3f2',
                        boxShadow: '0 10px 28px rgba(18, 44, 77, 0.28)',
                        backgroundColor: '#f9fcff',
                    },
                }}
            >
                <Box sx={{ p: 1.25, maxWidth: 280 }}>
                    <Typography variant='caption' sx={{ display: 'block', color: '#2c3f55', fontWeight: 700 }}>
                        Weather Details
                    </Typography>
                    <Typography variant='caption' sx={{ display: 'block', color: '#607286', mt: 0.5 }}>
                        Condition: {conditionLabel(resolvedCondition)}
                    </Typography>
                    <Typography variant='caption' sx={{ display: 'block', color: '#607286' }}>
                        Status: {statusLabel(resolvedStatus)}
                    </Typography>
                    <Typography variant='caption' sx={{ display: 'block', color: '#607286' }}>
                        Source: {sourceInfo.label.replace('Source: ', '')}
                    </Typography>
                    <Typography variant='caption' sx={{ display: 'block', color: '#607286' }}>
                        Forecast at: {formatForecastTime(forecastAt) || 'N/A'}
                    </Typography>
                    {unavailableMessage ? (
                        <Typography variant='caption' sx={{ display: 'block', color: '#ab3d2a', mt: 0.5 }}>
                            {unavailableMessage}
                        </Typography>
                    ) : null}
                </Box>
            </Popover>
        </Box>
    )
}

export default ScheduleWeatherPreview
