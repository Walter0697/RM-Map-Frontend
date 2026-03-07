import React, { useState, useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import _ from 'lodash'

import ViewListIcon from '@mui/icons-material/ViewList'
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import OpacityIcon from '@mui/icons-material/Opacity'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import useMap from '../../hooks/useMap'
import useBoop from '../../hooks/useBoop'

import LocationPreview from './mappart/LocationPreview'
import AutoHideAlert from '../AutoHideAlert'
import CircleIconButton from '../field/CircleIconButton'
import FilterCircleButton from '../wrapper/FilterCircleButton'

import maphelper from '../../scripts/map'
import constants from '../../constant'
import apis from '../../apis'
import {
    prefersReducedMotion,
    shouldAnimateWeatherTransition,
    WEATHER_TRANSITION_DURATION_MS,
} from './weatherUtils'

function MarkerMap({
    showingList,
    toListView,
    markers,
    filtercountry,
    setSelectedById,
    filterOption,
    filterValue,
    setFilterValue,
    isFilterExpanded,
    setExpandFilter,
    confirmFilterValue,
    finalFilterValue,
    customFilterValue,
    setCustomFilterValue,
    scheduleCreated,
    mappins,
    stations,
    showInMap,
}) {
    const mapElement = useRef(null)
    const previousWeatherViewportRef = useRef(null)
    const hasWeatherLoadedRef = useRef(false)

    const [ viewPreviewContent, setViewContent ] = useState(false)
    const [ hasPreviewContent, setPreviewContent ] = useState(false)

    const {
        mapOpacity,
        mapContentTransform,
        previewContentHeight,
        previewContentOpacity,
        backButtonBottom,
    } = useSpring({
        config: config.wobbly,
        from: {
            mapOpacity: 1,
            mapContentTransform: 'translate(0, 0)',
            previewContentHeight: '0%',
            previewContentOpacity: 0,
            backButtonBottom: '5%',
        },
        to: {
            mapOpacity: showingList ? 0 : 1,
            mapContentTransform: viewPreviewContent ? 'translate(0, -5%)' : 'translate(0, 0)',
            previewContentHeight: viewPreviewContent ? '20%' : (hasPreviewContent ? '5%' : '0%'),
            previewContentOpacity: (viewPreviewContent || hasPreviewContent) ? 1 : 0,
            backButtonBottom: viewPreviewContent ? '25%' : (hasPreviewContent ? '10%' : '5%'),
        },
    })

    const [ currentViewMarker, setViewMarker ] = useState(null)
    const [ gpsFail, setGPSFail ] = useBoop(3000)
    const [ previousCountry, setPreviousCountry ] = useState(null)

    const [ planningModeEnabled, setPlanningModeEnabled ] = useState(false)
    const [ weatherData, setWeatherData ] = useState([])
    const [ weatherViewport, setWeatherViewport ] = useState(null)
    const [ weatherLoading, setWeatherLoading ] = useState(false)
    const [ weatherUnavailable, setWeatherUnavailable ] = useState('')
    const [ weatherTransitionIndex, setWeatherTransitionIndex ] = useState(0)
    const [ weatherCenter, setWeatherCenter ] = useState(null)
    const [ forecastDayOffset, setForecastDayOffset ] = useState(1)
    const [ weatherStatusTooltipOpen, setWeatherStatusTooltipOpen ] = useState(false)
    const [ weatherFeatureEnabled, setWeatherFeatureEnabled ] = useState(false)

    const {
        weatherOpacity,
    } = useSpring({
        from: { weatherOpacity: 0 },
        to: { weatherOpacity: planningModeEnabled ? 1 : 0 },
        config: {
            duration: prefersReducedMotion() ? 0 : WEATHER_TRANSITION_DURATION_MS,
        },
    })

    const [
        map,
        mapLocation,
        updateMapLocation,
        searchingLocation,
        setMapToCenter,
        setSearchingToViewing,
        setLocation,
        clickedMarker,
        setClickedMarker,
        resetCenterMarker,
        centerLocation,
        centerStreetName,
        setCenterToLocation,
        setExtraLocationInformation,
        keepCenter,
        setKeepCenter,
        setLocationCenter,
    ] = useMap(
        mapElement,
        {
            longitude: -68.3030,
            latitude: -54.8019,
        },
        15,
        setGPSFail,
        mappins,
    )

    useEffect(() => {
        if (previousCountry) {
            if (!_.isEqual(previousCountry, filtercountry)) {
                if (filtercountry?.countryCode) {
                    let output = markers.filter(s => s.country_code === filtercountry.countryCode)
                    if (filtercountry?.countryPart && filtercountry?.countryPart?.type === 'part') {
                        output = output.filter(s => s.country_part === filtercountry.countryPart.name)
                    }

                    const position = maphelper.generic.getCenterFromMarkerList(output)
                    setLocationCenter(position.latitude, position.longitude)
                }
                const selectedCountry = _.cloneDeep(filtercountry)
                setPreviousCountry(selectedCountry)
            }
        } else {
            const selectedCountry = _.cloneDeep(filtercountry)
            setPreviousCountry(selectedCountry)
        }
    }, [markers, filtercountry, previousCountry])

    useEffect(() => {
        const output = []
        markers.forEach(item => {
            const pinType = maphelper.pins.getPinType(item)
            output.push({
                id: item.id,
                type: item.type,
                pin: pinType,
                location: {
                    lon: item.longitude,
                    lat: item.latitude,
                },
            })
        })

        setLocation(output)
    }, [markers, showingList])

    useEffect(() => {
        if (!clickedMarker || clickedMarker === -1) return
        if (clickedMarker.type === 'marker') {
            const marker = markers.find(s => s.id === clickedMarker.item.id)
            if (marker) {
                setViewMarker({
                    type: 'marker',
                    item: marker,
                })
                setViewContent(true)
                setPreviewContent(true)
            }
        } else {
            setViewMarker(clickedMarker)
            setViewContent(true)
            setPreviewContent(true)
        }
    }, [clickedMarker, markers])

    useEffect(() => {
        if (!scheduleCreated) return
        setClickedMarker(null)
        setViewMarker(null)
        setViewContent(false)
        setPreviewContent(false)
    }, [scheduleCreated])

    useEffect(() => {
        if (showInMap.markerMap) {
            setExtraLocationInformation(constants.overlay.typeStation, stations)
        } else {
            setExtraLocationInformation(constants.overlay.typeStation, [])
        }
    }, [stations, showInMap])

    useEffect(() => {
        if (!map) return undefined
        let cancelled = false

        const detectWeatherCapability = async () => {
            try {
                const bounds = map.getBounds()
                const center = map.getCenter()
                const query = {
                    min_lat: bounds.getSouth(),
                    max_lat: bounds.getNorth(),
                    min_lon: bounds.getWest(),
                    max_lon: bounds.getEast(),
                    center_lat: center.lat,
                    center_lon: center.lng,
                    zoom: map.getZoom(),
                    forecast_window_h: 48,
                    forecast_day_offset: 1,
                }
                const result = await apis.weather.planning(query)
                const payload = result?.data || {}
                if (cancelled) return
                const backendFeatureDisabled = payload?.error_code === 'feature_disabled'
                setWeatherFeatureEnabled(!backendFeatureDisabled)
                if (backendFeatureDisabled) {
                    setPlanningModeEnabled(false)
                    setWeatherUnavailable(payload?.error_message || 'Weather data unavailable')
                }
            } catch (err) {
                if (cancelled) return
                setWeatherFeatureEnabled(false)
            }
        }

        detectWeatherCapability()
        return () => {
            cancelled = true
        }
    }, [map])

    useEffect(() => {
        if (!map || !weatherFeatureEnabled || !planningModeEnabled) return undefined

        const fetchWeather = _.debounce(async () => {
            try {
                const bounds = map.getBounds()
                const center = map.getCenter()
                const query = {
                    min_lat: bounds.getSouth(),
                    max_lat: bounds.getNorth(),
                    min_lon: bounds.getWest(),
                    max_lon: bounds.getEast(),
                    center_lat: center.lat,
                    center_lon: center.lng,
                    zoom: map.getZoom(),
                    forecast_window_h: (forecastDayOffset + 1) * 24,
                    forecast_day_offset: forecastDayOffset,
                }
                if (!hasWeatherLoadedRef.current) {
                    setWeatherLoading(true)
                }
                const result = await apis.weather.planning(query)
                const payload = result?.data || {}
                const nextViewport = payload.viewport || null
                setWeatherCenter({
                    lat: Number(center.lat),
                    lon: Number(center.lng),
                })
                const shouldAnimate = shouldAnimateWeatherTransition(previousWeatherViewportRef.current, nextViewport) && !prefersReducedMotion()
                setWeatherViewport(nextViewport)
                previousWeatherViewportRef.current = nextViewport
                setWeatherData(payload.items || [])
                setWeatherUnavailable(payload.error_code ? (payload.error_message || 'Weather data unavailable') : '')
                hasWeatherLoadedRef.current = true
                if (shouldAnimate) {
                    setWeatherTransitionIndex(prev => prev + 1)
                }
            } catch (err) {
                setWeatherUnavailable('Weather data unavailable')
                setWeatherData([])
                hasWeatherLoadedRef.current = true
                try {
                    await apis.weather.reportOverlayEvent({
                        event: 'render_error',
                        message: err?.message || 'unknown weather overlay error',
                        user_agent: window?.navigator?.userAgent || '',
                    })
                } catch (telemetryErr) {
                    console.warn('weather telemetry failed', telemetryErr)
                }
            } finally {
                setWeatherLoading(false)
            }
        }, 500)

        fetchWeather()
        map.on('moveend', fetchWeather)
        map.on('zoomend', fetchWeather)
        return () => {
            fetchWeather.cancel()
            map.off('moveend', fetchWeather)
            map.off('zoomend', fetchWeather)
        }
    }, [map, planningModeEnabled, weatherFeatureEnabled, forecastDayOffset])

    const renderWeatherOverlays = () => {
        if (!planningModeEnabled || !map || weatherData.length === 0) return null
        const reducedMotion = prefersReducedMotion()
        return weatherData.map((item, index) => {
            if (item.precipitation_type === 'none') return null
            try {
                const point = map.project([item.lon, item.lat])
                let background = 'rgba(20, 120, 240, 0.30)'
                if (item.precipitation_type === 'snow') {
                    background = 'rgba(230, 240, 255, 0.55)'
                }
                const sizeByIntensity = {
                    light: 14,
                    moderate: 20,
                    heavy: 28,
                }
                const size = sizeByIntensity[item.intensity] || 12
                return (
                    <div
                        key={`${weatherTransitionIndex}-${index}-${item.lat}-${item.lon}`}
                        style={{
                            position: 'absolute',
                            left: point.x - (size / 2),
                            top: point.y - (size / 2),
                            width: `${size}px`,
                            height: `${size}px`,
                            borderRadius: '999px',
                            background,
                            border: '2px solid rgba(255,255,255,0.92)',
                            boxShadow: item.precipitation_type === 'snow'
                                ? '0 0 8px rgba(255,255,255,0.95), 0 0 16px rgba(210,230,255,0.75)'
                                : '0 0 8px rgba(115,175,255,0.95), 0 0 16px rgba(165,205,255,0.75)',
                            pointerEvents: 'none',
                            opacity: 0.92,
                            transition: reducedMotion ? 'none' : 'transform 0.6s ease, opacity 0.6s ease',
                            transform: reducedMotion ? 'none' : 'scale(1)',
                        }}
                    />
                )
            } catch (err) {
                return null
            }
        })
    }

    const reducedMotion = prefersReducedMotion()
    const activeZoom = weatherViewport?.zoom || 0
    const atmosphereZoomEnabled = activeZoom >= 8 && activeZoom <= 17
    const nearbyRadius = Math.max(0.03, 1.8 / Math.max(activeZoom, 1))
    const nearbyWeather = weatherData.filter(item => {
        if (!weatherCenter) return false
        return Math.abs(item.lat - weatherCenter.lat) <= nearbyRadius && Math.abs(item.lon - weatherCenter.lon) <= nearbyRadius
    })
    const nearbyRain = nearbyWeather.filter(item => item.precipitation_type === 'rain')
    const nearbySnow = nearbyWeather.filter(item => item.precipitation_type === 'snow')
    let atmosphereKind = 'none'
    if (nearbyRain.length > 0 || nearbySnow.length > 0) {
        atmosphereKind = nearbySnow.length > nearbyRain.length ? 'snow' : 'rain'
    }
    const intensityRank = { none: 0, light: 1, moderate: 2, heavy: 3 }
    const selectedItems = atmosphereKind === 'snow' ? nearbySnow : nearbyRain
    const atmosphereIntensityValue = selectedItems.reduce((max, item) => Math.max(max, intensityRank[item.intensity] || 0), 0)
    let atmosphereIntensity = 'light'
    if (atmosphereIntensityValue >= 3) atmosphereIntensity = 'heavy'
    else if (atmosphereIntensityValue >= 2) atmosphereIntensity = 'moderate'
    const shouldShowAtmosphere = weatherFeatureEnabled
        && planningModeEnabled
        && atmosphereZoomEnabled
        && atmosphereKind !== 'none'
        && !weatherUnavailable
    const weatherStatusDescription = weatherUnavailable
        ? weatherUnavailable
        : weatherLoading && weatherData.length === 0
            ? 'Loading forecast...'
            : !atmosphereZoomEnabled
                ? 'Zoom in between 8 and 17 to show atmosphere animation.'
                : atmosphereKind === 'none'
                    ? `No rain/snow detected near map center for ${forecastDayOffset} day(s) later.`
                    : `${atmosphereKind === 'snow' ? 'Snow' : 'Rain'} ${atmosphereIntensity} forecast near map center for ${forecastDayOffset} day(s) later.`
    const WeatherStatusIcon = weatherUnavailable
        ? CloudOffOutlinedIcon
        : weatherLoading && weatherData.length === 0
            ? HelpOutlineOutlinedIcon
            : atmosphereKind === 'snow'
                ? AcUnitIcon
                : atmosphereKind === 'rain'
                    ? OpacityIcon
                    : WbSunnyOutlinedIcon

    const snowflakeParticles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, index) => {
            const left = (index * 17) % 100
            const delay = (index % 10) * 0.45
            const duration = 4.8 + (index % 7) * 0.9
            const driftDuration = 2.2 + (index % 5) * 0.5
            const size = 12 + (index % 4) * 4
            const opacity = 0.36 + (index % 6) * 0.06
            return {
                id: index,
                left,
                delay,
                duration,
                driftDuration,
                size,
                opacity,
            }
        })
    }, [])

    const rainParticles = useMemo(() => {
        return Array.from({ length: 28 }).map((_, index) => {
            const left = (index * 13) % 100
            const delay = (index % 10) * 0.22
            const duration = 1.2 + (index % 6) * 0.16
            const driftDuration = 1.3 + (index % 5) * 0.2
            const length = 12 + (index % 4) * 5
            const opacity = 0.26 + (index % 5) * 0.08
            return {
                id: index,
                left,
                delay,
                duration,
                driftDuration,
                length,
                opacity,
            }
        })
    }, [])

    const forecastDayOptions = useMemo(() => {
        const now = new Date()
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return Array.from({ length: 7 }).map((_, idx) => {
            const offset = idx + 1
            const target = new Date(now)
            target.setDate(now.getDate() + offset)
            const mm = String(target.getMonth() + 1).padStart(2, '0')
            const dd = String(target.getDate()).padStart(2, '0')
            const weekday = weekdays[target.getDay()]
            return {
                offset,
                label: `${mm}/${dd} (${weekday})`,
            }
        })
    }, [])

    return (
        <>
            <animated.div
                ref={mapElement}
                className='mapDiv'
                style={{
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    position: 'absolute',
                    height: '100%',
                    transform: mapContentTransform,
                    width: '100%',
                }}
            />
            <animated.div
                style={{
                    position: 'absolute',
                    height: previewContentHeight,
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: previewContentOpacity,
                    width: '100%',
                    bottom: '0',
                }}
            >
                <LocationPreview
                    marker={currentViewMarker}
                    onOpen={() => setViewContent(true)}
                    onClose={() => setViewContent(false)}
                    shouldViewContent={viewPreviewContent}
                    setSelectedById={setSelectedById}
                />
            </animated.div>

            <animated.div
                style={{
                    position: 'absolute',
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    bottom: backButtonBottom,
                    left: '20px',
                }}
            >
                <CircleIconButton
                    onClickHandler={toListView}
                >
                    <ViewListIcon />
                </CircleIconButton>
            </animated.div>

            <animated.div
                style={{
                    position: 'absolute',
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    top: '5%',
                    left: '20px',
                }}
            >
                <FilterCircleButton
                    redirectPath={'/filter/map'}
                />
            </animated.div>

            <animated.div
                style={{
                    position: 'absolute',
                    visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                    opacity: mapOpacity,
                    bottom: backButtonBottom,
                    right: '20px',
                }}
            >
                <CircleIconButton
                    onClickHandler={() => setKeepCenter(true)}
                >
                    {keepCenter ? (
                        <CenterFocusStrongIcon />
                    ) : (
                        <CenterFocusWeakIcon />
                    )}
                </CircleIconButton>
            </animated.div>

            {weatherFeatureEnabled && (
                <animated.div
                    style={{
                        position: 'absolute',
                        visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                        opacity: mapOpacity,
                        top: '102px',
                        left: '20px',
                    }}
                >
                    <CircleIconButton
                        background='rgba(255, 255, 255, 0.95)'
                        onClickHandler={() => {
                            setPlanningModeEnabled(prev => !prev)
                            setWeatherStatusTooltipOpen(false)
                        }}
                    >
                        <CloudOutlinedIcon
                            sx={{
                                color: planningModeEnabled ? '#0f6cd9' : '#334155',
                                padding: '2px',
                                filter: planningModeEnabled
                                    ? 'drop-shadow(0 0 6px rgba(47, 128, 237, 0.85))'
                                    : 'none',
                                backgroundColor: 'transparent',
                                fontSize: '1.4rem',
                            }}
                        />
                    </CircleIconButton>
                </animated.div>
            )}

            {weatherFeatureEnabled && planningModeEnabled && (
                <animated.div
                    style={{
                        position: 'absolute',
                        visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                        opacity: mapOpacity,
                        top: '82px',
                        right: '20px',
                        zIndex: 20,
                    }}
                >
                    <Tooltip
                        open={weatherStatusTooltipOpen}
                        onClose={() => setWeatherStatusTooltipOpen(false)}
                        title={weatherStatusDescription}
                        placement='left'
                        arrow
                    >
                        <IconButton
                            size='small'
                            onClick={() => setWeatherStatusTooltipOpen(prev => !prev)}
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.96)',
                                border: '2px solid #0f172a',
                                boxShadow: '0 0 0 2px rgba(255,255,255,0.95), 0 0 8px rgba(15,23,42,0.45)',
                            }}
                        >
                            <WeatherStatusIcon
                                sx={{
                                    color: atmosphereKind === 'snow' ? '#69a8f6' : atmosphereKind === 'rain' ? '#2f80ed' : '#475569',
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                </animated.div>
            )}

            {weatherFeatureEnabled && planningModeEnabled && (
                <animated.div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        visibility: mapOpacity.to(o => o === 0 ? 'hidden' : 'visible'),
                        opacity: weatherOpacity,
                        zIndex: 11,
                    }}
                >
                    {shouldShowAtmosphere && (
                        <div
                            className={`weather-atmo weather-atmo--${atmosphereKind} weather-atmo--${atmosphereIntensity}${reducedMotion ? ' weather-atmo--reduced' : ''}`}
                        >
                            {atmosphereKind === 'snow' && (
                                <div className='weather-snowflake-field'>
                                    {snowflakeParticles.map(item => (
                                        <div
                                            key={item.id}
                                            className='weather-snowflake-particle'
                                            style={{
                                                left: `${item.left}%`,
                                                animationDuration: `${item.duration}s`,
                                                animationDelay: `${item.delay}s`,
                                                opacity: item.opacity,
                                            }}
                                        >
                                            <div
                                                className='weather-snowflake-drift'
                                                style={{ animationDuration: `${item.driftDuration}s` }}
                                            >
                                                <AcUnitIcon
                                                    sx={{
                                                        color: 'rgba(236, 246, 255, 0.96)',
                                                        fontSize: `${item.size}px`,
                                                        filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.9)) drop-shadow(0 0 8px rgba(189,219,255,0.85))',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {atmosphereKind === 'rain' && (
                                <div className='weather-rain-field'>
                                    {rainParticles.map(item => (
                                        <div
                                            key={item.id}
                                            className='weather-rain-particle'
                                            style={{
                                                left: `${item.left}%`,
                                                animationDuration: `${item.duration}s`,
                                                animationDelay: `${item.delay}s`,
                                                opacity: item.opacity,
                                            }}
                                        >
                                            <div
                                                className='weather-rain-drift'
                                                style={{ animationDuration: `${item.driftDuration}s` }}
                                            >
                                                <div
                                                    className='weather-rain-streak'
                                                    style={{ height: `${item.length}px` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {renderWeatherOverlays()}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '18px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(0, 0, 0, 0.6)',
                            color: '#fff',
                            borderRadius: '16px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span style={{ fontWeight: 600 }}>Forecast Day</span>
                        <select
                            value={forecastDayOffset}
                            onChange={(event) => setForecastDayOffset(Number(event.target.value))}
                            style={{
                                background: 'rgba(255,255,255,0.95)',
                                color: '#0f172a',
                                border: '1px solid #94a3b8',
                                borderRadius: '10px',
                                padding: '4px 8px',
                                pointerEvents: 'auto',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            {forecastDayOptions.map((item) => (
                                <option key={item.offset} value={item.offset}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                        <IconButton
                            size='small'
                            onClick={() => setWeatherStatusTooltipOpen(prev => !prev)}
                            sx={{
                                pointerEvents: 'auto',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.65)',
                            }}
                        >
                            <InfoOutlinedIcon fontSize='small' />
                        </IconButton>
                    </div>
                </animated.div>
            )}

            <AutoHideAlert
                open={gpsFail}
                type={'warning'}
                message={'Cannot retrieve GPS information'}
                timing={3000}
            />
        </>
    )
}

export default connect(state => ({
    mappins: state.marker.mappins,
    stations: state.station.stations,
    showInMap: state.station.showInMap,
    filtercountry: state.marker.filtercountry,
}))(MarkerMap)
