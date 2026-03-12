import React, { useState, useEffect, useMemo, useRef } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import {
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Popover,
    Slide,
    Tooltip,
    CircularProgress,
} from '@mui/material'
import backend from '../../constant/backend'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CancelIcon from '@mui/icons-material/Cancel'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import RefreshIcon from '@mui/icons-material/Refresh'
import SyncIcon from '@mui/icons-material/Sync'
import LinkIcon from '@mui/icons-material/Link'
import AltRouteIcon from '@mui/icons-material/AltRoute'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined'
import OpacityIcon from '@mui/icons-material/Opacity'
import SensorsIcon from '@mui/icons-material/Sensors'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'

import useBoop from '../../hooks/useBoop'

import AutoHideAlert from '../AutoHideAlert'
import RestaurantCard from '../card/RestaurantCard'

import constants from '../../constant'
import actions from '../../store/actions'
import graphql from '../../graphql'

import dayjs from 'dayjs'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const formatMinutesCompact = (minutes) => {
    const absoluteMinutes = Math.abs(minutes)
    if (absoluteMinutes < 60) {
        return `${absoluteMinutes}m`
    }

    const hours = Math.floor(absoluteMinutes / 60)
    const remainMinutes = absoluteMinutes % 60
    if (remainMinutes === 0) {
        return `${hours}h`
    }
    return `${hours}h ${remainMinutes}m`
}

const getDifficultyVisual = (transition) => {
    if (!transition || transition.status === 'unavailable') {
        return {
            color: '#8a97a8',
            icon: SentimentNeutralIcon,
            title: 'Travel unavailable',
        }
    }

    if (transition.difficulty === 'easy') {
        return {
            color: '#2e7d32',
            icon: SentimentSatisfiedAltIcon,
            title: 'Easy',
        }
    }
    if (transition.difficulty === 'difficult') {
        return {
            color: '#c62828',
            icon: SentimentVeryDissatisfiedIcon,
            title: 'Difficult',
        }
    }
    return {
        color: '#ef6c00',
        icon: SentimentNeutralIcon,
        title: 'Moderate',
    }
}

const formatSignedSeconds = (seconds) => {
    const minutes = Math.round(Math.abs(seconds) / 60)
    const formatted = formatMinutesCompact(minutes)
    return `${seconds >= 0 ? '+' : '-'}${formatted}`
}

const formatDurationFromSeconds = (seconds) => {
    const parsed = Number(seconds)
    if (Number.isNaN(parsed) || parsed < 0) return 'N/A'
    if (parsed < 60) return 'less than a minute'

    const totalMinutes = Math.round(parsed / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours <= 0) {
        return `${minutes} minute${minutes === 1 ? '' : 's'}`
    }
    if (minutes <= 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`
    }
    return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`
}

const toNumberOrFallback = (...values) => {
    for (let i = 0; i < values.length; i++) {
        const value = values[i]
        if (value === undefined || value === null || value === '') continue
        const parsed = Number(value)
        if (!Number.isNaN(parsed)) return parsed
    }
    return 0
}

const extractTransitionCoordinate = (endpoint = {}) => {
    const lat = toNumberOrFallback(endpoint?.lat, endpoint?.latitude)
    const lon = toNumberOrFallback(endpoint?.lon, endpoint?.longitude)
    if (lat === 0 && lon === 0) return null
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null
    return { lat, lon }
}

const parseRouteGeometryPoints = (geometry) => {
    const raw = `${geometry || ''}`.trim()
    if (!raw) return []
    return raw
        .split(';')
        .map((item) => item.trim())
        .filter((item) => item)
        .map((item) => {
            const [latRaw, lonRaw] = item.split(',').map((value) => `${value || ''}`.trim())
            const lat = Number(latRaw)
            const lon = Number(lonRaw)
            if (Number.isNaN(lat) || Number.isNaN(lon)) return null
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null
            return { lat, lon }
        })
        .filter((item) => item)
}

const formatCoordinateLabel = (value) => {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return 'N/A'
    return parsed.toFixed(5)
}

const routeModeStyles = {
    driving: { label: 'Driving', color: '#1a73e8' },
    walking: { label: 'Walking', color: '#2e7d32' },
    bus: { label: 'Bus', color: '#ef6c00' },
    public_transit: { label: 'Transit', color: '#8e24aa' },
    direct: { label: 'Direct', color: '#546e7a' },
}

const getWeatherConditionLabel = (type = '') => {
    const normalized = `${type || ''}`.trim().toLowerCase()
    if (!normalized || normalized === 'none') return 'Clear'
    if (normalized === 'rain') return 'Rain'
    if (normalized === 'snow') return 'Snow'
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const getWeatherStatusLabel = (status = '') => {
    const normalized = `${status || ''}`.trim().toLowerCase()
    if (normalized === 'fresh') return 'Fresh'
    if (normalized === 'stale') return 'Stale'
    if (normalized === 'unavailable') return 'Unavailable'
    if (normalized === 'loading') return 'Loading'
    return 'Fresh'
}

const getWeatherSourceMeta = (source = '') => {
    const normalized = `${source || ''}`.trim().toLowerCase()
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

const getWeatherVisual = (summary) => {
    const status = `${summary?.status || ''}`.trim().toLowerCase()
    const condition = `${summary?.condition || ''}`.trim().toLowerCase()
    if (status === 'unavailable') {
        return {
            Icon: CloudOffOutlinedIcon,
            color: '#9e2e1b',
        }
    }
    if (condition === 'snow') {
        return {
            Icon: AcUnitIcon,
            color: '#3d8bda',
        }
    }
    if (condition === 'rain') {
        return {
            Icon: OpacityIcon,
            color: '#2962b8',
        }
    }
    return {
        Icon: WbSunnyOutlinedIcon,
        color: '#cf8a05',
    }
}

const toWeatherCacheKey = (schedule) => {
    const lat = Number(schedule?.marker?.latitude)
    const lon = Number(schedule?.marker?.longitude)
    const selectedAt = dayjs(schedule?.selected_date)
    if (!selectedAt.isValid() || Number.isNaN(lat) || Number.isNaN(lon)) return ''
    return `${lat.toFixed(5)}:${lon.toFixed(5)}:${selectedAt.format('YYYY-MM-DDTHH:mm')}`
}

const appendRoutePoints = (existing, incoming) => {
    const base = Array.isArray(existing) ? [...existing] : []
    if (!Array.isArray(incoming) || incoming.length === 0) return base
    if (base.length === 0) return [...incoming]

    const last = base[base.length - 1]
    incoming.forEach((point, index) => {
        if (
            index === 0
            && last
            && Math.abs(last.lat - point.lat) < 1e-7
            && Math.abs(last.lon - point.lon) < 1e-7
        ) {
            return
        }
        base.push(point)
    })
    return base
}

const encodeRouteGeometryPoints = (points = []) => {
    if (!Array.isArray(points) || points.length === 0) return ''
    return points
        .map((point) => `${Number(point.lat).toFixed(5)},${Number(point.lon).toFixed(5)}`)
        .join(';')
}

const buildCombinedRoutePreview = (segments = [], stops = []) => {
    if (!Array.isArray(segments) || segments.length === 0) return null

    const first = segments[0]
    const last = segments[segments.length - 1]
    const modePoints = {}
    let totalDistanceMeters = 0

    const etaModes = ['walking', 'bus', 'public_transit']
    const etaStats = {}
    etaModes.forEach((mode) => {
        etaStats[mode] = { availableCount: 0, totalSeconds: 0 }
    })

    segments.forEach((segment) => {
        const route = segment?.route || {}
        const distance = Number(route?.distance_meters || 0)
        if (!Number.isNaN(distance) && distance > 0) {
            totalDistanceMeters += distance
        }

        const rawPaths = route?.paths || {}
        const segmentPathEntries = Object.entries(rawPaths).length > 0
            ? Object.entries(rawPaths)
            : [['driving', route?.geometry || '']]
        segmentPathEntries.forEach(([mode, geometry]) => {
            const parsedPoints = parseRouteGeometryPoints(geometry)
            if (parsedPoints.length < 2) return
            modePoints[mode] = appendRoutePoints(modePoints[mode], parsedPoints)
        })

        etaModes.forEach((mode) => {
            const eta = route?.eta?.[mode]
            const seconds = Number(eta?.seconds)
            if (eta?.available && !Number.isNaN(seconds) && seconds >= 0) {
                etaStats[mode].availableCount += 1
                etaStats[mode].totalSeconds += seconds
            }
        })
    })

    const paths = {}
    Object.entries(modePoints).forEach(([mode, points]) => {
        const geometry = encodeRouteGeometryPoints(points)
        if (geometry) {
            paths[mode] = geometry
        }
    })

    const eta = {}
    etaModes.forEach((mode) => {
        const stats = etaStats[mode]
        if (stats.availableCount === segments.length) {
            eta[mode] = {
                available: true,
                seconds: Math.round(stats.totalSeconds),
            }
            return
        }
        eta[mode] = {
            available: false,
            code: 'partial_eta_unavailable',
            message: `available on ${stats.availableCount}/${segments.length} segments`,
        }
    })

    return {
        route: {
            origin: first?.route?.origin || null,
            destination: last?.route?.destination || null,
            distance_meters: Math.round(totalDistanceMeters),
            geometry: paths.driving || '',
            paths,
            eta,
        },
        originLabel: first?.originLabel || '',
        destinationLabel: last?.destinationLabel || '',
        stops,
    }
}

const scheduleFooterIconButtonStyle = {
    border: '1px solid rgba(18, 36, 77, 0.35)',
    borderRadius: '10px',
    backgroundColor: '#eef4ff',
    padding: '8px',
    '&:hover': {
        backgroundColor: '#dfeaff',
    },
}

const getMarkerTypeIconPath = (item, eventtypes = []) => {
    const markerType = item?.marker?.type || item?.marker?.marker_type || item?.marker?.type_id
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

const toScheduleImageSrc = (item, eventtypes = []) => {
    const rawPath = item?.image_path || item?.movie?.image_path || item?.marker?.image_link || getMarkerTypeIconPath(item, eventtypes) || ''
    if (!rawPath) return ''
    if (/^(https?:)?\/\//i.test(rawPath)) return rawPath

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

function ScheduleItem({
    item,
    eventtypes,
    transition,
    syncInfo,
    weatherSummary,
    weatherLoading,
    triggerCopyMessage,
    isToday,
    onEditClick,
    onDeleteClick,
    onRoutePreviewClick,
    routePreviewLoading,
}) {
    // const imageLink = useMemo(() => {
    //     // if (!item || !item.marker) return ''
        
    //     // return markerhelper.image.marker_image(item.marker, eventtypes)
    //     return item.image_path
    // }, [item, eventtypes])  // if marker has image, use this, if not, use the type image

    const [ imageExist, setImageExist ] = useState(false)
    const [ explanationAnchor, setExplanationAnchor ] = useState(null)
    const [ weatherDetailAnchor, setWeatherDetailAnchor ] = useState(null)

    const imageSrc = toScheduleImageSrc(item, eventtypes)

    useEffect(() => {
        if (imageSrc) {
            setImageExist(true)
        } else {
            setImageExist(false)
        }
    }, [imageSrc])

    const onImageFailedToLoad = () => {
        setImageExist(false)
    }

    const title = (item) => {
        let color = '#0e0eb7'
        let display_time = dayjs(item.selected_date).format('HH:mm')
        let display_icon = false
        if (item.status === constants.status.arrived) {
            color = '#27c31e'
            display_icon = (<AssignmentTurnedInIcon />)
        } 
        if (item.status === constants.status.cancelled) {
            color = '#af8d90'
            display_icon = (<CancelIcon />)
            display_time = '--:--'
        }

        return (
            <div style={{
                fontSize: '30px',
                fontWeight: '500',
                color: color,
                lineHeight: 1,
            }}>
                {display_icon} {display_time}
            </div>
        )
    }

    const transitionVisual = getDifficultyVisual(transition)
    const FaceIcon = transitionVisual.icon
    const transitionTravelSeconds = toNumberOrFallback(
        transition?.duration_seconds,
        transition?.travel_duration_seconds,
        transition?.travel_time_seconds,
        transition?.duration,
    )
    const transitionGapSeconds = toNumberOrFallback(
        transition?.scheduled_gap_seconds,
        transition?.between_time_seconds,
        transition?.gap_seconds,
        transition?.scheduled_gap,
    )
    const hasTravelDuration = transition?.duration_seconds !== undefined
        || transition?.travel_duration_seconds !== undefined
        || transition?.travel_time_seconds !== undefined
        || transition?.duration !== undefined
    const hasGapDuration = transition?.scheduled_gap_seconds !== undefined
        || transition?.between_time_seconds !== undefined
        || transition?.gap_seconds !== undefined
        || transition?.scheduled_gap !== undefined
    const travelTimeDisplay = hasTravelDuration ? formatMinutesCompact(Math.round(transitionTravelSeconds / 60)) : 'N/A'
    const gapTimeDisplay = hasGapDuration ? formatMinutesCompact(Math.round(transitionGapSeconds / 60)) : 'N/A'
    const lineHeight = 70
    const descriptionText = item?.description || item?.marker?.description || ''

    const explanationText = (() => {
        if (!transition || transition.status === 'unavailable') {
            return 'Travel estimate is unavailable for this pair.'
        }
        const travelText = travelTimeDisplay
        const gapText = gapTimeDisplay
        const deltaSeconds = toNumberOrFallback(
            transition?.delta_seconds,
            transition?.buffer_seconds,
            transition?.difference_seconds,
        )
        const deltaText = transition.delta_seconds === undefined
            && transition.buffer_seconds === undefined
            && transition.difference_seconds === undefined
            ? 'N/A'
            : formatSignedSeconds(deltaSeconds)
        return `Gap: ${gapText}, Travel: ${travelText}, Buffer: ${deltaText}.`
    })()

    const normalizedSyncStatus = (() => {
        const rawStatus = `${syncInfo?.sync_status || syncInfo?.status || ''}`.trim().toLowerCase()
        if (rawStatus === 'synced' || rawStatus === 'pending' || rawStatus === 'failed' || rawStatus === 'disconnected') {
            return rawStatus
        }
        if ((syncInfo?.external_event_id || '').trim() !== '') {
            return 'synced'
        }
        return 'disconnected'
    })()

    const syncStatusLabel = (() => {
        const status = normalizedSyncStatus
        if (status === 'synced') return 'Synced'
        if (status === 'pending') return 'Sync pending'
        if (status === 'failed') return 'Sync failed'
        if (status === 'disconnected') return (syncInfo?.external_event_id || '').trim() !== '' ? 'Disconnected' : 'Not synced'
        return 'Not synced'
    })()

    const syncStatusColor = (() => {
        const status = normalizedSyncStatus
        if (status === 'synced') return 'success'
        if (status === 'pending') return 'warning'
        if (status === 'failed') return 'error'
        if (status === 'disconnected') return (syncInfo?.external_event_id || '').trim() !== '' ? 'warning' : 'default'
        return 'default'
    })()

    const syncError = syncInfo?.last_error_message || ''
    const hasTransitionCoordinates = !!extractTransitionCoordinate(transition?.origin) && !!extractTransitionCoordinate(transition?.destination)
    const googleCalendarOpenUrl = (() => {
        const eventDate = dayjs(item?.selected_date)
        if (!eventDate.isValid()) return 'https://calendar.google.com/calendar/u/0/r'
        return `https://calendar.google.com/calendar/u/0/r/day/${eventDate.format('YYYY/M/D')}`
    })()
    const weatherVisual = getWeatherVisual(weatherSummary)
    const WeatherIcon = weatherVisual.Icon
    const weatherSource = getWeatherSourceMeta(weatherSummary?.source)
    const WeatherSourceIcon = weatherSource.Icon
    const weatherChipLabel = weatherLoading
        ? 'Weather Loading'
        : `Weather ${getWeatherConditionLabel(weatherSummary?.condition)} / ${getWeatherStatusLabel(weatherSummary?.status)}`
    const weatherDetailOpen = !!weatherDetailAnchor

    return (
        <div style={{ width: '100%' }}>
            <div
                style={{
                    width: '100%',
                    borderRadius: '12px',
                    border: '1px solid #d8e0ea',
                    backgroundColor: '#fff',
                    padding: '14px 14px 12px',
                }}
            >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <div>{title(item)}</div>
                {(!isToday || (isToday && !item.status)) && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: '2px',
                        }}
                    >
                        <IconButton size='small' onClick={() => onEditClick(item)}>
                            <EditIcon sx={{ color: '#88b7ff' }} />
                        </IconButton>
                        <IconButton size='small' onClick={() => onDeleteClick(item)}>
                            <DeleteIcon sx={{ color: '#ff8888' }} />
                        </IconButton>
                    </div>
                )}
            </div>

            <div
                style={{
                    height: '2px',
                    display: 'block',
                    background: 'linear-gradient(to right, rgba(154,170,186,1) 0%, rgba(154,170,186,1) 45%, rgba(154,170,186,0) 100%)',
                    marginTop: '10px',
                    marginBottom: '12px',
                    width: '100%',
                }}
            />

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    width: '100%',
                    alignItems: 'stretch',
                }}
            >
                <div style={{ width: '118px', minWidth: '118px' }}>
                    {imageExist ? (
                        <img
                            style={{
                                width: '118px',
                                height: '100%',
                                minHeight: '106px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                display: 'block',
                            }}
                            src={imageSrc}
                            onError={onImageFailedToLoad}
                        />
                    ) : (
                        <div
                            style={{
                                height: '100%',
                                minHeight: '106px',
                                width: '118px',
                                backgroundColor: '#a3bdd8',
                                borderRadius: '6px',
                            }}
                        />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: '17px',
                            color: 'black',
                            fontWeight: 'bold',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {item.label}
                    </div>
                    {descriptionText && (
                        <div
                            style={{
                                marginTop: '4px',
                                fontSize: '13px',
                                color: '#455295',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {descriptionText}
                        </div>
                    )}
                    {item.marker && item.marker.address && (
                        <div
                            style={{
                                marginTop: '6px',
                                fontSize: '13px',
                                color: '#455295',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                overflowWrap: 'anywhere',
                            }}
                        >
                            <span style={{ flex: 1 }}>{item.marker.address}</span>
                            <IconButton
                                size='small'
                                onClick={() => {
                                    if (navigator?.clipboard?.writeText) {
                                        navigator.clipboard.writeText(item.marker.address)
                                    }
                                    triggerCopyMessage()
                                }}
                            >
                                <ContentCopyIcon fontSize='small' />
                            </IconButton>
                        </div>
                    )}
                </div>
            </div>

            {item.marker && item.marker.restaurant && (
                <div style={{ marginTop: '10px' }}>
                    <RestaurantCard
                        restaurant={item.marker.restaurant}
                    />
                </div>
            )}
            {item.movie && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#455295' }}>
                    Movie: {item.movie.label}
                </div>
            )}
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <Chip size='small' color={syncStatusColor} label={syncStatusLabel} />
                <div
                    onClick={(event) => setWeatherDetailAnchor(event.currentTarget)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                    }}
                >
                    <Chip
                        size='small'
                        variant='outlined'
                        icon={<WeatherIcon sx={{ color: `${weatherVisual.color} !important` }} />}
                        label={weatherChipLabel}
                    />
                    <Tooltip title={weatherSource.label}>
                        <WeatherSourceIcon sx={{ fontSize: '15px', color: weatherSource.color }} />
                    </Tooltip>
                </div>
                <div style={{ flex: 1 }} />
                <IconButton
                    size='small'
                    onClick={() => window.open(googleCalendarOpenUrl, '_blank', 'noopener,noreferrer')}
                    aria-label='Open Google Calendar Day'
                >
                    <CalendarTodayIcon fontSize='small' />
                </IconButton>
            </div>
            {syncError && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#b34b3d' }}>
                    {syncError}
                </div>
            )}
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
                <div style={{ padding: '10px 12px', maxWidth: '280px', fontSize: '13px', color: '#344861' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>Weather Details</div>
                    <div>Condition: {getWeatherConditionLabel(weatherSummary?.condition)}</div>
                    <div>Status: {getWeatherStatusLabel(weatherSummary?.status)}</div>
                    <div>Source: {weatherSource.label.replace('Source: ', '')}</div>
                    <div>Forecast at: {weatherSummary?.forecastAt || 'N/A'}</div>
                    {weatherSummary?.errorMessage ? (
                        <div style={{ color: '#b33434', marginTop: '4px' }}>{weatherSummary.errorMessage}</div>
                    ) : null}
                </div>
            </Popover>
            </div>
            {transition && (
                <div style={{ marginTop: '14px' }}>
                    <div style={{ marginTop: '8px', marginBottom: '4px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '18px',
                                    marginLeft: '8px',
                                    marginRight: '8px',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '94px' }}>
                                    <div style={{ fontSize: '11px', color: '#5f6f83', textAlign: 'center', lineHeight: 1.2 }}>
                                        <div>Schedule</div>
                                        <div>between</div>
                                        <div>time</div>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#2f4056' }}>
                                        {gapTimeDisplay}
                                    </div>
                                    <div style={{ width: '3px', height: `${lineHeight}px`, backgroundColor: transitionVisual.color, borderRadius: '2px' }} />
                                    <ArrowDownwardIcon sx={{ color: transitionVisual.color, fontSize: '18px' }} />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '44px',
                                        gap: '6px',
                                    }}
                                >
                                    <IconButton
                                        size='small'
                                        onClick={(event) => setExplanationAnchor(event.currentTarget)}
                                        sx={{ color: transitionVisual.color }}
                                    >
                                        <FaceIcon fontSize='medium' />
                                    </IconButton>
                                    <DirectionsWalkIcon sx={{ color: transitionVisual.color, fontSize: '24px' }} />
                                    {hasTransitionCoordinates && (
                                        <Tooltip title='Route Preview'>
                                            <span>
                                                <IconButton
                                                    size='medium'
                                                    onClick={() => onRoutePreviewClick && onRoutePreviewClick(transition)}
                                                    disabled={routePreviewLoading}
                                                    sx={{
                                                        color: transitionVisual.color,
                                                        border: `1px solid ${transitionVisual.color}`,
                                                        borderRadius: '10px',
                                                        backgroundColor: '#f4f8ff',
                                                        padding: '10px',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                                                        '&:hover': {
                                                            backgroundColor: '#e8f0ff',
                                                        },
                                                        '&.Mui-disabled': {
                                                            borderColor: '#aeb8c4',
                                                            backgroundColor: '#f2f4f7',
                                                        },
                                                    }}
                                                >
                                                    <AltRouteIcon fontSize='medium' />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '94px' }}>
                                    <div style={{ fontSize: '11px', color: '#5f6f83', textAlign: 'center', lineHeight: 1.2 }}>
                                        <div>Estimated</div>
                                        <div>travel</div>
                                        <div>time</div>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#2f4056' }}>
                                        {travelTimeDisplay}
                                    </div>
                                    <div style={{ width: '3px', height: `${lineHeight}px`, backgroundColor: transitionVisual.color, borderRadius: '2px' }} />
                                    <ArrowDownwardIcon sx={{ color: transitionVisual.color, fontSize: '18px' }} />
                                </div>
                            </div>
                            <Popover
                                open={!!explanationAnchor}
                                anchorEl={explanationAnchor}
                                onClose={() => setExplanationAnchor(null)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                            >
                                <div style={{ padding: '10px 12px', maxWidth: '280px', fontSize: '13px', color: '#344861' }}>
                                    {explanationText}
                                </div>
                            </Popover>
                    </div>
                </div>
            )}
        </div>
    )
}

function ScheduleView({
    open,
    handleClose,
    schedules,
    selected_date,
    activeScheduleId,
    fetchStatus,
    fetchError,
    onRetry,
    onRefresh,
    onScheduleRemoved,
    openArriveForm,
    openEditForm,
    jwt,
    eventtypes,
    dispatch,
}) {
    const history = useHistory()
    const [ removeScheduleGQL, { data: removeData, loading: removeLoading, error: removeError } ] = useMutation(graphql.schedules.remove, { errorPolicy: 'all' })

    const [ deletingId, setDeleting ] = useState(-1)

    // if request failed
    const [ failedAlert, fail ] = useBoop(3000)
    const [ failMessage, setFailMessage ] = useState('')

    const todayString = dayjs().format('YYYY-MM-DD')

    const sortedList = useMemo(() => {
        if (!schedules) return []
        if (schedules.length === 0) return []

        const sorted = [...schedules].sort((a, b) => {
            if (dayjs(a.selected_date).isAfter(dayjs(b.selected_date))) {
                return 1
            }
            return -1
        })

        return sorted
    }, [schedules])

    useEffect(() => {
        if (removeData) {
            if (deletingId !== -1) {
                dispatch(actions.updateMarkerStatus(removeData.removeSchedule))
                dispatch(actions.removeSchedule(deletingId))
                if (onScheduleRemoved) {
                    onScheduleRemoved(deletingId)
                } else if (onRefresh) {
                    onRefresh()
                }
                setDeleting(-1)
            }
        }

        if (removeError) {
            setFailMessage(removeError.message)
            fail()
        }
    }, [removeData, removeError, deletingId, onScheduleRemoved, onRefresh])

    const isToday = useMemo(() => {
        return todayString === selected_date
    })

    const [ copyMessage, triggerCopyMessage ] = useBoop(3000)
    const [ syncQueuedAlert, triggerSyncQueuedAlert ] = useBoop(3000)
    const [ transitionAnalysis, setTransitionAnalysis ] = useState([])
    const [ transitionFetchStatus, setTransitionFetchStatus ] = useState('idle')
    const [ transitionFetchMessage, setTransitionFetchMessage ] = useState('')
    const transitionRequestVersionRef = useRef(0)
    const [ providerConnected, setProviderConnected ] = useState(false)
    const [ syncStatusBySchedule, setSyncStatusBySchedule ] = useState({})
    const [ syncActionLoading, setSyncActionLoading ] = useState({})
    const [ routePreviewOpen, setRoutePreviewOpen ] = useState(false)
    const [ routePreviewLoading, setRoutePreviewLoading ] = useState(false)
    const [ routePreviewError, setRoutePreviewError ] = useState('')
    const [ routePreviewResult, setRoutePreviewResult ] = useState(null)
    const [ routePreviewTitle, setRoutePreviewTitle ] = useState('Route Preview')
    const [ routeModeFilter, setRouteModeFilter ] = useState('all')
    const [ weatherByScheduleId, setWeatherByScheduleId ] = useState({})
    const [ weatherLoadingByScheduleId, setWeatherLoadingByScheduleId ] = useState({})
    const weatherPreviewCacheRef = useRef({})
    const routeMapContainerRef = useRef(null)
    const routeMapRef = useRef(null)

    const availableRouteModes = useMemo(() => {
        if (!routePreviewResult?.route) return []
        const keys = Object.keys(routePreviewResult.route.paths || {})
        if (keys.length > 0) return keys
        const hasDefaultGeometry = `${routePreviewResult?.route?.geometry || ''}`.trim() !== ''
        return hasDefaultGeometry ? ['driving'] : []
    }, [routePreviewResult])

    const onEditClickHandler = (schedule) => {
        openEditForm(schedule)
    }

    const onDeleteClickHandler = (schedule) => {
        if (!window.confirm(`Do you want to remove ${schedule.label}`)) return
        setDeleting(schedule.id)
        removeScheduleGQL({ variables: { id: schedule.id } })
    }

    useEffect(() => {
        const fetchTransitionAnalysis = async () => {
            if (!open || !jwt || !sortedList || sortedList.length <= 1) {
                setTransitionAnalysis([])
                setTransitionFetchStatus('idle')
                setTransitionFetchMessage('')
                return
            }

            const requestVersion = transitionRequestVersionRef.current + 1
            transitionRequestVersionRef.current = requestVersion
            setTransitionFetchStatus('loading')
            setTransitionFetchMessage('')

            const requestSchedules = sortedList.map((schedule) => ({
                schedule_id: schedule.id,
                marker_id: schedule.marker?.id || null,
                label: schedule.label,
                lat: schedule.marker?.latitude,
                lon: schedule.marker?.longitude,
                selected_date: schedule.selected_date,
            }))

            try {
                const response = await fetch(backend.withBasePath('schedules/travel-analysis'), {
                    method: 'POST',
                    headers: {
                        Authorization: jwt,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        schedules: requestSchedules,
                    }),
                })
                if (!response.ok) {
                    if (transitionRequestVersionRef.current !== requestVersion) return
                    setTransitionAnalysis([])
                    setTransitionFetchStatus('error')
                    setTransitionFetchMessage(`Travel analysis endpoint returned ${response.status}`)
                    return
                }
                const payload = await response.json()
                if (transitionRequestVersionRef.current !== requestVersion) return
                setTransitionAnalysis(payload?.transition_analysis || [])
                setTransitionFetchStatus('success')
                setTransitionFetchMessage('')
            } catch (error) {
                if (transitionRequestVersionRef.current !== requestVersion) return
                setTransitionAnalysis([])
                setTransitionFetchStatus('error')
                setTransitionFetchMessage('Travel analysis request failed before reaching provider')
            }
        }

        fetchTransitionAnalysis()
    }, [open, jwt, sortedList, activeScheduleId, fetchStatus])

    useEffect(() => {
        if (!open || !jwt || !sortedList || sortedList.length === 0) {
            setWeatherByScheduleId({})
            setWeatherLoadingByScheduleId({})
            return
        }

        const loadingState = {}
        const nextWeatherState = {}
        const pending = []

        sortedList.forEach((schedule) => {
            const scheduleId = schedule?.id
            if (!scheduleId) return
            const cacheKey = toWeatherCacheKey(schedule)
            if (!cacheKey) {
                nextWeatherState[scheduleId] = {
                    status: 'unavailable',
                    condition: 'unavailable',
                    source: 'degraded',
                }
                return
            }
            const cached = weatherPreviewCacheRef.current[cacheKey]
            if (cached) {
                nextWeatherState[scheduleId] = cached
                return
            }
            loadingState[scheduleId] = true
            pending.push({ schedule, cacheKey })
        })

        setWeatherByScheduleId(nextWeatherState)
        setWeatherLoadingByScheduleId(loadingState)

        if (pending.length === 0) return
        let cancelled = false

        const loadWeather = async () => {
            const resolvedState = {}
            const resolvedLoadingState = {}
            await Promise.all(pending.map(async ({ schedule, cacheKey }) => {
                const scheduleId = schedule?.id
                if (!scheduleId) return

                const lat = Number(schedule?.marker?.latitude)
                const lon = Number(schedule?.marker?.longitude)
                const selectedAt = dayjs(schedule?.selected_date)
                if (!selectedAt.isValid() || Number.isNaN(lat) || Number.isNaN(lon)) {
                    const fallback = {
                        status: 'unavailable',
                        condition: 'unavailable',
                        source: 'degraded',
                        forecastAt: '',
                        errorMessage: 'Marker location is incomplete.',
                    }
                    weatherPreviewCacheRef.current[cacheKey] = fallback
                    resolvedState[scheduleId] = fallback
                    resolvedLoadingState[scheduleId] = false
                    return
                }

                const now = dayjs()
                const offsetDays = clamp(selectedAt.startOf('day').diff(now.startOf('day'), 'day'), 0, 16)
                const query = new URLSearchParams({
                    min_lat: lat.toFixed(5),
                    max_lat: lat.toFixed(5),
                    min_lon: lon.toFixed(5),
                    max_lon: lon.toFixed(5),
                    center_lat: lat.toFixed(5),
                    center_lon: lon.toFixed(5),
                    zoom: '13',
                    forecast_window_h: `${clamp((offsetDays + 1) * 24, 24, 16 * 24)}`,
                    forecast_day_offset: `${offsetDays}`,
                })

                try {
                    const response = await fetch(`${backend.withBasePath('weather/planning')}?${query.toString()}`, {
                        headers: {
                            Authorization: jwt,
                        },
                    })
                    if (!response.ok) {
                        throw new Error(`weather request failed (${response.status})`)
                    }
                    const payload = await response.json()
                    const topItem = payload?.items?.[0] || {}
                    const freshness = payload?.freshness || {}
                    const errorMessage = `${payload?.error_message || ''}`.trim()
                    const unavailable = errorMessage !== ''
                    const forecastAtRaw = `${topItem?.forecast_timestamp || ''}`.trim()
                    const forecastAt = forecastAtRaw
                        ? (dayjs(forecastAtRaw).isValid() ? dayjs(forecastAtRaw).format('YYYY-MM-DD HH:mm') : forecastAtRaw)
                        : ''
                    const summary = {
                        status: unavailable ? 'unavailable' : (freshness?.status || 'fresh'),
                        condition: unavailable ? 'unavailable' : (topItem?.precipitation_type || 'none'),
                        source: freshness?.source || payload?.provider || 'degraded',
                        forecastAt,
                        errorMessage,
                    }
                    weatherPreviewCacheRef.current[cacheKey] = summary
                    resolvedState[scheduleId] = summary
                } catch (error) {
                    const fallback = {
                        status: 'unavailable',
                        condition: 'unavailable',
                        source: 'degraded',
                        forecastAt: '',
                        errorMessage: error?.message || 'Weather request failed',
                    }
                    weatherPreviewCacheRef.current[cacheKey] = fallback
                    resolvedState[scheduleId] = fallback
                } finally {
                    resolvedLoadingState[scheduleId] = false
                }
            }))

            if (cancelled) return
            setWeatherByScheduleId((prev) => ({ ...prev, ...resolvedState }))
            setWeatherLoadingByScheduleId((prev) => ({ ...prev, ...resolvedLoadingState }))
        }

        loadWeather()
        return () => {
            cancelled = true
        }
    }, [open, jwt, sortedList, fetchStatus])

    const normalizedViewStatus = useMemo(() => {
        if (fetchStatus === 'loading' || fetchStatus === 'error') return fetchStatus
        if (!sortedList || sortedList.length === 0) return 'empty'
        return 'success'
    }, [fetchStatus, sortedList])

    useEffect(() => {
        const loadCalendarStatus = async () => {
            if (!open || !jwt) {
                setProviderConnected(false)
                setSyncStatusBySchedule({})
                return
            }
            try {
                const providerResponse = await fetch(backend.withBasePath('calendar/providers/status'), {
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (providerResponse.ok) {
                    const providerPayload = await providerResponse.json()
                    const items = Array.isArray(providerPayload.items) ? providerPayload.items : []
                    const active = items.some((item) => item.provider_key === 'google_calendar' && item.status === 'active')
                    setProviderConnected(active)
                } else {
                    setProviderConnected(false)
                }
            } catch (error) {
                setProviderConnected(false)
            }

            const ids = sortedList.map((item) => item.id).join(',')
            if (!ids) {
                setSyncStatusBySchedule({})
                return
            }
            try {
                const syncResponse = await fetch(backend.withBasePath(`calendar/schedules/status?ids=${encodeURIComponent(ids)}`), {
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!syncResponse.ok) {
                    return
                }
                const syncPayload = await syncResponse.json()
                const nextStatus = {}
                const items = Array.isArray(syncPayload.items) ? syncPayload.items : []
                items.forEach((item) => {
                    nextStatus[item.schedule_id] = item
                })
                setSyncStatusBySchedule((prev) => ({ ...prev, ...nextStatus }))
            } catch (error) {
                // keep previous status snapshot to avoid flipping labels on transient request failures
            }
        }

        loadCalendarStatus()
    }, [open, jwt, sortedList])

    const withBulkSyncAction = async (actionFn) => {
        const ids = sortedList.map((item) => item.id)
        if (ids.length === 0) return
        setSyncActionLoading((prev) => {
            const next = { ...prev }
            ids.forEach((id) => {
                next[id] = true
            })
            return next
        })
        try {
            await actionFn()
            triggerSyncQueuedAlert()
        } catch (error) {
            setFailMessage(error?.message || 'Calendar sync request failed')
            fail()
        } finally {
            setSyncActionLoading((prev) => {
                const next = { ...prev }
                ids.forEach((id) => {
                    next[id] = false
                })
                return next
            })
        }
    }

    const refreshSyncStatus = async () => {
        const ids = sortedList.map((item) => item.id).join(',')
        if (!ids || !jwt) return {}
        const response = await fetch(backend.withBasePath(`calendar/schedules/status?ids=${encodeURIComponent(ids)}`), {
            headers: {
                Authorization: jwt,
            },
        })
        if (!response.ok) return {}
        const payload = await response.json()
        const incomingStatus = {}
        const items = Array.isArray(payload.items) ? payload.items : []
        items.forEach((item) => {
            incomingStatus[item.schedule_id] = item
        })
        let mergedStatus = {}
        setSyncStatusBySchedule((prev) => {
            mergedStatus = { ...prev, ...incomingStatus }
            return mergedStatus
        })
        return mergedStatus
    }

    const onConnectProvider = () => {
        const target = backend.withBasePath(`calendar/google/connect?token=${encodeURIComponent(jwt || '')}`)
        window.location.href = target
    }

    const onSyncNow = async () => {
        await withBulkSyncAction(async () => {
            const failures = []
            const optimisticStatuses = {}
            for (const schedule of sortedList) {
                const response = await fetch(backend.withBasePath(`calendar/schedules/${schedule.id}/sync-now`), {
                    method: 'POST',
                    headers: {
                        Authorization: jwt,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ provider: 'google_calendar' }),
                })
                if (!response.ok) {
                    failures.push(`${schedule.label}: request failed (${response.status})`)
                    continue
                }
                let payload = {}
                try {
                    payload = await response.json()
                } catch (error) {
                    payload = {}
                }
                if (payload?.status) {
                    optimisticStatuses[schedule.id] = {
                        ...(syncStatusBySchedule[schedule.id] || {}),
                        schedule_id: schedule.id,
                        provider_key: 'google_calendar',
                        sync_status: payload.status,
                        external_event_id: payload?.result?.external_event_id || syncStatusBySchedule[schedule.id]?.external_event_id || '',
                        last_error_message: payload?.result?.last_error_message || '',
                        last_error_code: payload?.result?.last_error_code || '',
                    }
                }
                if (payload?.status === 'failed') {
                    failures.push(`${schedule.label}: ${payload?.result?.last_error_message || 'Calendar sync failed'}`)
                }
            }
            if (Object.keys(optimisticStatuses).length > 0) {
                setSyncStatusBySchedule((prev) => ({ ...prev, ...optimisticStatuses }))
            }
            await refreshSyncStatus()
            if (failures.length > 0) {
                throw new Error(`Failed to sync ${failures.length} item(s). ${failures[0]}`)
            }
        })
    }

    const onOpenRoutePreview = async (transition) => {
        const origin = extractTransitionCoordinate(transition?.origin)
        const destination = extractTransitionCoordinate(transition?.destination)
        if (!origin || !destination) {
            setFailMessage('Route preview is unavailable because coordinates are missing.')
            fail()
            return
        }
        if (!jwt) {
            setFailMessage('You must be logged in to load route preview.')
            fail()
            return
        }

        setRoutePreviewOpen(true)
        setRoutePreviewLoading(true)
        setRoutePreviewError('')
        setRoutePreviewResult(null)
        setRoutePreviewTitle('Route Preview')
        setRouteModeFilter('all')

        try {
            const response = await fetch(backend.withBasePath('schedules/route-preview'), {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ origin, destination }),
            })
            if (!response.ok) {
                const text = await response.text()
                setRoutePreviewError(text || `Route preview request failed (${response.status})`)
                return
            }
            let payload = null
            try {
                payload = await response.json()
            } catch (error) {
                const raw = await response.text()
                setRoutePreviewError(raw || 'Route preview response was not valid JSON')
                return
            }
            setRoutePreviewResult({
                ...payload,
                originLabel: transition?.origin?.label || '',
                destinationLabel: transition?.destination?.label || '',
            })
        } catch (error) {
            setRoutePreviewError(error?.message || 'Failed to load route preview')
        } finally {
            setRoutePreviewLoading(false)
        }
    }

    const onOpenWholeScheduleRoutePreview = async () => {
        if (!jwt) {
            setFailMessage('You must be logged in to load route preview.')
            fail()
            return
        }
        if (!sortedList || sortedList.length < 2) {
            setFailMessage('At least 2 schedule items are required for whole-schedule route preview.')
            fail()
            return
        }

        const pairs = []
        const stopMap = {}
        const orderedStops = []
        sortedList.forEach((schedule) => {
            const coordinate = extractTransitionCoordinate({
                lat: schedule?.marker?.latitude,
                lon: schedule?.marker?.longitude,
            })
            if (!coordinate) return
            const key = `${coordinate.lat.toFixed(6)},${coordinate.lon.toFixed(6)}`
            if (stopMap[key]) return
            const stop = {
                lat: coordinate.lat,
                lon: coordinate.lon,
                label: schedule?.label || schedule?.marker?.label || '',
            }
            stopMap[key] = stop
            orderedStops.push(stop)
        })
        for (let index = 0; index < sortedList.length - 1; index++) {
            const current = sortedList[index]
            const next = sortedList[index + 1]
            const origin = extractTransitionCoordinate({
                lat: current?.marker?.latitude,
                lon: current?.marker?.longitude,
            })
            const destination = extractTransitionCoordinate({
                lat: next?.marker?.latitude,
                lon: next?.marker?.longitude,
            })
            if (!origin || !destination) continue
            pairs.push({
                origin,
                destination,
                originLabel: current?.label || current?.marker?.label || '',
                destinationLabel: next?.label || next?.marker?.label || '',
            })
        }

        if (pairs.length === 0) {
            setFailMessage('Whole-schedule preview is unavailable because schedule markers are missing coordinates.')
            fail()
            return
        }

        setRoutePreviewOpen(true)
        setRoutePreviewLoading(true)
        setRoutePreviewError('')
        setRoutePreviewResult(null)
        setRoutePreviewTitle('Whole Schedule Route Preview')
        setRouteModeFilter('all')

        try {
            const responses = await Promise.all(
                pairs.map(async (pair) => {
                    const response = await fetch(backend.withBasePath('schedules/route-preview'), {
                        method: 'POST',
                        headers: {
                            Authorization: jwt,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            origin: pair.origin,
                            destination: pair.destination,
                        }),
                    })
                    if (!response.ok) {
                        return null
                    }
                    const payload = await response.json()
                    return {
                        ...payload,
                        originLabel: pair.originLabel,
                        destinationLabel: pair.destinationLabel,
                    }
                })
            )

            const validResponses = responses.filter((item) => !!item)
            if (validResponses.length === 0) {
                setRoutePreviewError('Whole-schedule route preview failed for all segments.')
                return
            }

            const combined = buildCombinedRoutePreview(validResponses, orderedStops)
            if (!combined) {
                setRoutePreviewError('Whole-schedule route preview is unavailable.')
                return
            }

            if (validResponses.length < pairs.length) {
                combined.route = {
                    ...combined.route,
                    warnings: [
                        `${pairs.length - validResponses.length} segment(s) failed to load and were skipped.`,
                    ],
                }
            }
            setRoutePreviewResult(combined)
        } catch (error) {
            setRoutePreviewError(error?.message || 'Failed to load whole schedule route preview')
        } finally {
            setRoutePreviewLoading(false)
        }
    }

    useEffect(() => {
        if (!routePreviewOpen || !routePreviewResult || !routeMapContainerRef.current) {
            return
        }
        const apiKey = `${process.env.REACT_APP_MAP_APIKEY || ''}`.trim()
        if (!apiKey) {
            return
        }
        const originCoordinate = extractTransitionCoordinate(routePreviewResult?.route?.origin)
        const destinationCoordinate = extractTransitionCoordinate(routePreviewResult?.route?.destination)
        const stopCoordinates = Array.isArray(routePreviewResult?.stops)
            ? routePreviewResult.stops
                .map((stop) => ({
                    ...stop,
                    coordinate: extractTransitionCoordinate(stop),
                }))
                .filter((stop) => !!stop.coordinate)
            : []
        const rawPaths = routePreviewResult?.route?.paths || {}
        const routePathsByMode = Object.entries(rawPaths)
            .map(([mode, geometry]) => ({
                mode,
                points: parseRouteGeometryPoints(geometry),
            }))
            .filter((item) => item.points.length >= 2)
        const defaultGeometryPoints = parseRouteGeometryPoints(routePreviewResult?.route?.geometry)
        if (routePathsByMode.length === 0 && defaultGeometryPoints.length >= 2) {
            routePathsByMode.push({ mode: 'driving', points: defaultGeometryPoints })
        }
        if (routePathsByMode.length === 0 && originCoordinate && destinationCoordinate) {
            routePathsByMode.push({ mode: 'direct', points: [originCoordinate, destinationCoordinate] })
        }
        if (routePathsByMode.length === 0) {
            return
        }
        const effectivePathsByMode = routeModeFilter === 'all'
            ? routePathsByMode
            : routePathsByMode.filter((path) => path.mode === routeModeFilter)
        const activePathsByMode = effectivePathsByMode.length > 0 ? effectivePathsByMode : routePathsByMode

        let cancelled = false

        const mountRouteMap = async () => {
            const ttModule = await import('@tomtom-international/web-sdk-maps')
            if (cancelled) return
            const tt = ttModule?.default || ttModule

            if (routeMapRef.current) {
                routeMapRef.current.remove()
                routeMapRef.current = null
            }

            const initialPoint = activePathsByMode[0].points[0]
            const map = tt.map({
                key: apiKey,
                container: routeMapContainerRef.current,
                center: [initialPoint.lon, initialPoint.lat],
                zoom: 10,
            })
            routeMapRef.current = map

            map.on('load', () => {
                if (cancelled) return
                const boundsCoordinates = []
                activePathsByMode.forEach((path, index) => {
                    const coordinates = path.points.map((point) => [point.lon, point.lat])
                    boundsCoordinates.push(...coordinates)
                    const sourceId = `route-preview-line-${index}`
                    const layerId = `route-preview-line-layer-${index}`
                    const style = routeModeStyles[path.mode] || { color: '#546e7a' }
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates,
                            },
                        },
                    })
                    map.addLayer({
                        id: layerId,
                        type: 'line',
                        source: sourceId,
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round',
                        },
                        paint: {
                            'line-color': style.color,
                            'line-width': 5,
                            'line-opacity': 0.9,
                        },
                    })
                })

                if (originCoordinate) {
                    new tt.Marker({ color: '#0f9d58' }).setLngLat([originCoordinate.lon, originCoordinate.lat]).addTo(map)
                    boundsCoordinates.push([originCoordinate.lon, originCoordinate.lat])
                }
                if (destinationCoordinate) {
                    new tt.Marker({ color: '#db4437' }).setLngLat([destinationCoordinate.lon, destinationCoordinate.lat]).addTo(map)
                    boundsCoordinates.push([destinationCoordinate.lon, destinationCoordinate.lat])
                }
                if (stopCoordinates.length > 0) {
                    stopCoordinates.forEach((stop, index) => {
                        const { coordinate } = stop
                        const element = document.createElement('div')
                        element.style.width = '20px'
                        element.style.height = '20px'
                        element.style.borderRadius = '50%'
                        element.style.backgroundColor = '#122d57'
                        element.style.color = '#ffffff'
                        element.style.fontSize = '11px'
                        element.style.fontWeight = '700'
                        element.style.display = 'flex'
                        element.style.alignItems = 'center'
                        element.style.justifyContent = 'center'
                        element.style.border = '1px solid #ffffff'
                        element.textContent = `${index + 1}`
                        const marker = new tt.Marker({ element }).setLngLat([coordinate.lon, coordinate.lat])
                        if (stop.label) {
                            marker.setPopup(new tt.Popup({ offset: 12 }).setText(`${index + 1}. ${stop.label}`))
                        }
                        marker.addTo(map)
                        boundsCoordinates.push([coordinate.lon, coordinate.lat])
                    })
                }

                let minLon = boundsCoordinates[0][0]
                let minLat = boundsCoordinates[0][1]
                let maxLon = boundsCoordinates[0][0]
                let maxLat = boundsCoordinates[0][1]
                boundsCoordinates.forEach(([lon, lat]) => {
                    minLon = Math.min(minLon, lon)
                    minLat = Math.min(minLat, lat)
                    maxLon = Math.max(maxLon, lon)
                    maxLat = Math.max(maxLat, lat)
                })
                map.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: 36, duration: 0 })
            })
        }

        mountRouteMap().catch(() => {
            // Keep static image visible as fallback when map SDK cannot initialize.
        })

        return () => {
            cancelled = true
            if (routeMapRef.current) {
                routeMapRef.current.remove()
                routeMapRef.current = null
            }
        }
    }, [routePreviewOpen, routePreviewResult, routeModeFilter])

    const onOpenCalendarSettings = () => {
        handleClose()
        history.push('/setting')
    }

    return (
        <>
            <Dialog
                fullWidth
                maxWidth={'lg'}
                open={open}
                onClose={handleClose}
                scroll={'paper'}
                TransitionComponent={TransitionUp}
            >
                { sortedList && (
                    <>
                        <DialogTitle>
                            {normalizedViewStatus === 'loading'
                                ? 'Loading schedule...'
                                : (isToday ? 'Today\'s schedule' : (selected_date || 'Schedule details'))}
                        </DialogTitle>
                        <DialogContent dividers>
                            {normalizedViewStatus === 'loading' && (
                                <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    Loading schedule details...
                                </div>
                            )}
                            {normalizedViewStatus === 'error' && (
                                <div style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                                    <div>{fetchError || 'Failed to load schedule details.'}</div>
                                    <Button variant='outlined' onClick={onRetry}>Retry</Button>
                                </div>
                            )}
                            {normalizedViewStatus === 'empty' && (
                                <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    No schedule details available.
                                </div>
                            )}
                            {normalizedViewStatus === 'success' && (
                                <>
                                    {transitionFetchStatus === 'error' && (
                                        <div style={{ marginBottom: '10px', color: '#b33434', fontSize: '13px' }}>
                                            {transitionFetchMessage || 'Travel estimates are temporarily unavailable. Tap Refresh to retry.'}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                                        {sortedList.map((schedule, index) => (
                                            <ScheduleItem
                                                key={index}
                                                item={schedule}
                                                eventtypes={eventtypes}
                                                transition={transitionAnalysis[index] || null}
                                                syncInfo={syncStatusBySchedule[schedule.id] || null}
                                                weatherSummary={weatherByScheduleId[schedule.id] || null}
                                                weatherLoading={!!weatherLoadingByScheduleId[schedule.id]}
                                                triggerCopyMessage={triggerCopyMessage}
                                                isToday={isToday}
                                                onEditClick={onEditClickHandler}
                                                onDeleteClick={onDeleteClickHandler}
                                                onRoutePreviewClick={onOpenRoutePreview}
                                                routePreviewLoading={routePreviewLoading}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </>
                )}
                {(normalizedViewStatus === 'success' || normalizedViewStatus === 'error') && (
                    <DialogActions>
                        <Tooltip title='Refresh'>
                            <span>
                                <IconButton aria-label='refresh schedule' onClick={onRefresh} sx={scheduleFooterIconButtonStyle}>
                                    <RefreshIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Calendar Settings'>
                            <span>
                                <IconButton aria-label='open calendar settings' onClick={onOpenCalendarSettings} sx={scheduleFooterIconButtonStyle}>
                                    <CalendarTodayIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Whole Schedule Route Preview'>
                            <span>
                                <IconButton
                                    aria-label='preview whole schedule route'
                                    onClick={onOpenWholeScheduleRoutePreview}
                                    disabled={routePreviewLoading || !sortedList || sortedList.length < 2}
                                    sx={scheduleFooterIconButtonStyle}
                                >
                                    <AltRouteIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {!providerConnected ? (
                            <Tooltip title='Connect Google Calendar'>
                                <span>
                                    <IconButton
                                        aria-label='connect google calendar'
                                        onClick={onConnectProvider}
                                        disabled={Object.values(syncActionLoading).some((value) => !!value)}
                                        sx={scheduleFooterIconButtonStyle}
                                    >
                                        <LinkIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : (
                            <Tooltip title='Sync Whole Schedule'>
                                <span>
                                    <IconButton
                                        aria-label='sync whole schedule'
                                        onClick={onSyncNow}
                                        disabled={Object.values(syncActionLoading).some((value) => !!value)}
                                        sx={scheduleFooterIconButtonStyle}
                                    >
                                        <SyncIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {isToday && normalizedViewStatus === 'success' && (
                            <Button onClick={openArriveForm}>Arrived</Button>
                        )}
                    </DialogActions>
                )}
                
            </Dialog>
            <Dialog
                fullWidth
                maxWidth={'md'}
                open={routePreviewOpen}
                onClose={() => setRoutePreviewOpen(false)}
            >
                <DialogTitle>{routePreviewTitle}</DialogTitle>
                <DialogContent dividers>
                    {routePreviewLoading && (
                        <div style={{ minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress size={28} />
                        </div>
                    )}
                    {!routePreviewLoading && routePreviewError && (
                        <div style={{ color: '#b33434', fontSize: '14px' }}>
                            {routePreviewError}
                        </div>
                    )}
                    {!routePreviewLoading && !routePreviewError && routePreviewResult && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '14px', color: '#33496a' }}>
                                {routePreviewResult.originLabel && routePreviewResult.destinationLabel
                                    ? `${routePreviewResult.originLabel} -> ${routePreviewResult.destinationLabel}`
                                    : 'Selected schedule transition'}
                            </div>
                            <div
                                ref={routeMapContainerRef}
                                style={{
                                    width: '100%',
                                    height: '300px',
                                    borderRadius: '8px',
                                    border: '1px solid #d7deea',
                                    overflow: 'hidden',
                                }}
                            />
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '13px', color: '#425878' }}>
                                <span>Distance: {routePreviewResult?.route?.distance_meters ?? 'N/A'} m</span>
                                <span>Walk ETA: {formatDurationFromSeconds(routePreviewResult?.route?.eta?.walking?.seconds)}</span>
                                <span>Bus ETA: {formatDurationFromSeconds(routePreviewResult?.route?.eta?.bus?.seconds)}</span>
                                <span>Transit ETA: {formatDurationFromSeconds(routePreviewResult?.route?.eta?.public_transit?.seconds)}</span>
                                {Array.isArray(routePreviewResult?.stops) && routePreviewResult.stops.length > 0 && (
                                    <span>Stops: {routePreviewResult.stops.length}</span>
                                )}
                            </div>
                            {Array.isArray(routePreviewResult?.route?.warnings) && routePreviewResult.route.warnings.length > 0 && (
                                <div style={{ fontSize: '12px', color: '#8a6d3b' }}>
                                    {routePreviewResult.route.warnings.join(' ')}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                                {availableRouteModes.length > 1 && (
                                    <Chip
                                        size='small'
                                        label='All'
                                        clickable
                                        color={routeModeFilter === 'all' ? 'primary' : 'default'}
                                        variant={routeModeFilter === 'all' ? 'filled' : 'outlined'}
                                        onClick={() => setRouteModeFilter('all')}
                                    />
                                )}
                                {availableRouteModes.map((mode) => {
                                    const style = routeModeStyles[mode] || { label: mode, color: '#546e7a' }
                                    return (
                                        <Chip
                                            key={mode}
                                            size='small'
                                            clickable
                                            label={style.label}
                                            onClick={() => setRouteModeFilter(mode)}
                                            color={routeModeFilter === mode ? 'primary' : 'default'}
                                            variant={routeModeFilter === mode ? 'filled' : 'outlined'}
                                            sx={{
                                                borderColor: style.color,
                                            }}
                                        />
                                    )
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: '#5d6f8e' }}>
                                <span>
                                    Start marker: {formatCoordinateLabel(routePreviewResult?.route?.origin?.lat)}, {formatCoordinateLabel(routePreviewResult?.route?.origin?.lon)}
                                </span>
                                <span>
                                    End marker: {formatCoordinateLabel(routePreviewResult?.route?.destination?.lat)}, {formatCoordinateLabel(routePreviewResult?.route?.destination?.lon)}
                                </span>
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoutePreviewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            <AutoHideAlert 
                open={failedAlert}
                type={'error'}
                message={failMessage}
                timing={3000}
            />
            <AutoHideAlert 
                open={copyMessage}
                type={'success'}
                message={'address copied!'}
                timing={2000}
            />
            <AutoHideAlert
                open={syncQueuedAlert}
                type={'success'}
                message={'Calendar sync completed'}
                timing={2500}
            />
        </>
    )
}


export default connect(state => ({
    jwt: state.auth.jwt,
    eventtypes: state?.marker?.eventtypes || [],
}))(ScheduleView)
