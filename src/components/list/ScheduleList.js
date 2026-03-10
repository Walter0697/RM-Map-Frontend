import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import { Virtuoso } from 'react-virtuoso'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import backend from '../../constant/backend'
import { 
    Grid,
    Button,
} from '@mui/material'

import useBoop from '../../hooks/useBoop'

import WrapperBox from '../wrapper/WrapperBox'

import generic from '../../scripts/generic'
import filters from '../../scripts/filter'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

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
    selected_date,
    eventtypes,
    onClickHandler,
}) {
    const imageMarkers = useMemo(() => {
        if (!item) return []
        return item
            .map((scheduleItem) => {
                const resolvedPath = getScheduleImagePath(scheduleItem, eventtypes)
                if (!resolvedPath) return null
                return {
                    ...scheduleItem,
                    image_path: resolvedPath,
                }
            })
            .filter(Boolean)
    }, [item, eventtypes])

    const scheduleItemOnClick = () => {
        if (!item || (item && item.length === 0)) return
    
        onClickHandler(item, selected_date)
    }

    return (
        <Button 
            variant='contained'
            size='large'
            style={{
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                paddingLeft: '12px',
                paddingRight: '12px',
            }}
            onClick={scheduleItemOnClick}
        >
            <Grid 
                container
                fullWidth
                style={{
                    alignContent: 'flex-start',
                }}
            >
                <Grid
                    item xs={12} 
                    style={{
                        height: '44px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        paddingTop: '2px',
                        fontSize: '19px',
                        fontWeight: 500,
                        color: '#455295',
                    }}
                >
                     {selected_date}
                </Grid>
                <Grid
                    item xs={12}
                    style={{
                        height: '72px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        paddingTop: '4px',
                        color: '#455295',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                    }}
                >
                    {imageMarkers.map((sche, index) => (
                        <div key={index}
                            style={{
                                width: '50px',
                                marginRight: '8px',
                            }}
                        >
                            <div
                                style={{
                                    height: '50px',
                                    width: '50px',
                                    overflow: 'hidden',
                                    borderRadius: '5px',
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <img
                                    width='50px'
                                    height='50px'
                                    src={toScheduleImageSrc(sche.image_path)}
                                    style={{
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </Grid>
            </Grid>
        </Button>
    )
}

function TodayList({
    list,
    imageList,
    eventtypes,
    onClickHandler,
}) {
    const [ isBlinking, setBlink ] = useBoop(500)
    const [ bigImageMarkers, setBigMarkers ] = useState([]) // select two markers to display it big
    const [ smallDisplayMarkers, setSmallMarkers ] = useState([])

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: isBlinking ? 0 : 1,
    })

    useEffect(() => {
        let timer = null
        const baseList = (imageList && imageList.length > 0 ? imageList : list) || []
        const filteredList = baseList
            .map((item) => {
                const imagePath = getScheduleImagePath(item, eventtypes)
                if (!imagePath) return null
                return {
                    ...item,
                    image_path: imagePath,
                }
            })
            .filter(Boolean)
        setRandomBigImageMarker(filteredList)

        if (filteredList.length > 2) {
            timer = window.setInterval(() => {
                setRandomBigImageMarker(filteredList)
            }, 5000)
        }

        return () => {
            if (timer) {
                window.clearInterval(timer)
            }
        }
    }, [imageList, list, eventtypes])

    const setRandomBigImageMarker = (filteredList) => {
        if (!filteredList || filteredList.length === 0) {
            setBigMarkers([])
            setSmallMarkers([])
            return
        }

        if (filteredList.length <= 2) {
            setBigMarkers(filteredList)
            setSmallMarkers(filteredList)
            return
        }

        let displayList = []
        const randList = generic.math.nonRepeatNumber(2, filteredList.length)
        if (randList) {
            randList.forEach((index) => {
                displayList.push(filteredList[index])
            })
    
            let smallList = []
            filteredList.forEach((item, index) => {
                if (!randList.has(index)) {
                    smallList.push(item)
                }
            })

            setBlink()
            setTimeout(() => {
                setBigMarkers(displayList)
                setSmallMarkers(smallList)
            }, 500)
        }  
    }

    const getTodayInformation = () => {
        if (!list || (list && list.length === 0)) {
            return (
                <Grid 
                    item xs={12}
                    style={{
                        height: '300px',
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#445295',
                    }}
                >
                    There is no plan today...
                </Grid>
            )
        }
        const primaryDisplayList = bigImageMarkers.length > 0 ? bigImageMarkers : (list || []).slice(0, 2)
        const secondaryDisplayList = smallDisplayMarkers.length > 0 ? smallDisplayMarkers : (list || []).slice(2, 8)
        return (
            <animated.div
                style={{
                    opacity: x,
                    width: '100%',
                }}
            >
                <Grid 
                    item xs={12}
                    fullWidth
                    style={{
                        height: '304px',
                        width: '100%',
                        color: '#445295',
                    }}
                >
                    <Grid container fullWidth>
                        <Grid 
                            item xs={6}
                            style={{
                                width: '50%',
                                maxWidth: '50%',
                                flexBasis: '50%',
                                paddingRight: '12px',
                            }}    
                        >
                            {primaryDisplayList.length >= 1 ? (
                                <>
                                    <div style={{ 
                                        width: '100%', 
                                        height: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                    }}>
                                        {getScheduleImagePath(primaryDisplayList[0], eventtypes) && (
                                            <div style={{
                                                width: '100%',
                                                maxWidth: '100%',
                                                height: '136px',
                                                borderRadius: '8px',
                                                backgroundColor: 'transparent',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                overflow: 'hidden',
                                            }}>
                                                <img
                                                    src={toScheduleImageSrc(getScheduleImagePath(primaryDisplayList[0], eventtypes))}
                                                    style={{
                                                        maxHeight: '100%',
                                                        maxWidth: '100%',
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '13px', textAlign: 'left', paddingRight: '10px' }}>
                                        {primaryDisplayList[0].label}
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </Grid>
                        <Grid 
                            item xs={6}
                            style={{
                                width: '50%',
                                maxWidth: '50%',
                                flexBasis: '50%',
                                paddingLeft: '12px',
                            }}    
                        >
                            {primaryDisplayList.length >= 2 ? (
                                <>
                                    <div style={{ 
                                        width: '100%', 
                                        height: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                    }}>
                                        {getScheduleImagePath(primaryDisplayList[1], eventtypes) && (
                                            <div style={{
                                                width: '100%',
                                                maxWidth: '100%',
                                                height: '136px',
                                                borderRadius: '8px',
                                                backgroundColor: 'transparent',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                overflow: 'hidden',
                                            }}>
                                                <img 
                                                    src={toScheduleImageSrc(getScheduleImagePath(primaryDisplayList[1], eventtypes))}
                                                    style={{
                                                        maxHeight: '100%',
                                                        maxWidth: '100%',
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '13px', textAlign: 'left', paddingRight: '10px' }}>
                                        {primaryDisplayList[1].label}
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    item xs={12}
                    style={{
                        height: '70px',
                        width: '100%',
                        color: '#445295',
                        display: 'flex',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                    }}
                >
                    {secondaryDisplayList.map((sche, index) => (
                        <div 
                            key={index}
                            style={{
                                width: '50px',
                               // overflow: 'hidden',
                                marginRight: '15px',
                            }}
                        >
                            <div
                                style={{
                                    height: '50px',
                                    width: '50px',
                                    overflow: 'hidden',
                                    borderRadius: '5px',
                                }}
                            >
                                <img 
                                    width='50px'
                                    height='50px'
                                    src={toScheduleImageSrc(getScheduleImagePath(sche, eventtypes))}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    ))}
                </Grid>
            </animated.div>
        )
    }

    const todayListOnClick = () => {
        if (!list || (list && list.length === 0)) return

        const dayKey = dayjs(list[0].selected_date).format('YYYY-MM-DD')
        onClickHandler(list, dayKey)
    }

    return (
        <Button 
            variant='contained'
            size='large'
            style={{
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                justifyContent: 'flex-start',
            }}
            onClick={todayListOnClick}
        >
            <Grid 
                container
                fullWidth
            >
                <Grid
                    item xs={12} 
                    style={{
                        height: '50px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        paddingTop: '10px',
                        paddingLeft: '8px',
                        fontSize: '20px',
                        color: '#455295',
                    }}
                >
                    Today&apos;s schedules
                </Grid>
                {getTodayInformation()}
            </Grid>
        </Button>
    )
}

function ScheduleList({
    openScheduleView,
    eventtypes,
    schedules,
    schedulesOverride,
    onReachEnd,
    hasMore,
    loadingMore,
    loadingError,
    onRetry,
    staleData,
    offlineCached,
    onRefreshTop,
    refreshing,
}) {
    // generic utility
    const location = useLocation()
    const refreshArmedRef = useRef(false)
    const [ scrollerEl, setScrollerEl ] = useState(null)
    const [ refreshUI, setRefreshUI ] = useState('hidden')

    const scheduleSource = Array.isArray(schedulesOverride) && schedulesOverride.length > 0
        ? schedulesOverride
        : (schedules || [])

    const enrichedScheduleSource = useMemo(() => {
        if (!Array.isArray(scheduleSource) || scheduleSource.length === 0) return []

        return scheduleSource.map((item) => {
            const hasImageData = !!getScheduleImagePath(item, eventtypes)
            if (hasImageData) return item

            const fallback = (schedules || []).find((raw) => raw?.id === item?.id)
            if (!fallback) return item

            return {
                ...fallback,
                ...item,
                image_path: item?.image_path || fallback?.image_path,
                image_link: item?.image_link || fallback?.image_link,
                marker: item?.marker || fallback?.marker,
                movie: item?.movie || fallback?.movie,
                selected_marker: item?.selected_marker || fallback?.selected_marker,
            }
        })
    }, [scheduleSource, schedules, eventtypes])

    const today_schedules = useMemo(() => {
        if (!enrichedScheduleSource) return []
        const baseToday = filters.schedules.get_today(enrichedScheduleSource)
        if (!Array.isArray(baseToday) || baseToday.length === 0) return []

        return baseToday.map((item) => {
            const hasImageData = !!getScheduleImagePath(item, eventtypes)
            if (hasImageData) return item

            const fallback = (schedules || []).find((raw) => raw?.id === item?.id)
            if (!fallback) return item

            return {
                ...fallback,
                ...item,
                image_path: item?.image_path || fallback?.image_path,
                image_link: item?.image_link || fallback?.image_link,
                marker: item?.marker || fallback?.marker,
                movie: item?.movie || fallback?.movie,
                selected_marker: item?.selected_marker || fallback?.selected_marker,
            }
        })
    }, [enrichedScheduleSource, schedules, eventtypes])

    const today_schedules_with_image = useMemo(() => {
        if (!enrichedScheduleSource) return []
        return filters.schedules.get_today_image(enrichedScheduleSource, eventtypes)
    }, [enrichedScheduleSource, eventtypes])

    const upcoming_schedules = useMemo(() => {
        if (!enrichedScheduleSource) return []
        
        const upcoming_list = filters.schedules.get_upcoming(enrichedScheduleSource)
        
        // use dictionary for grouping the schedules into each day
        let result = {}
        upcoming_list.forEach((sd) => {
            const dayKey = dayjs(sd.selected_date).format('YYYY-MM-DD')
            const displayDate = dayjs(sd.selected_date).format('MM/DD/YYYY')
            if (dayKey in result) {
                result[dayKey].items.push(sd)
            } else {
                result[dayKey] = {
                    dayKey,
                    displayDate,
                    items: [sd],
                }
            }
        })

        // create an array with dictionary
        const result_arr = Object.values(result)

        // sorted the array according to date
        const sorted = result_arr.sort((a, b) => {
            if (a.dayKey < b.dayKey) return -1
            if (a.dayKey > b.dayKey) return 1
            return 0
        })

        return sorted
    }, [enrichedScheduleSource])

    useEffect(() => {
        let timeout = null
        if (location.pathname === '/schedule/open') {
            timeout = window.setTimeout(() => {
                const dayKey = today_schedules && today_schedules.length > 0
                    ? dayjs(today_schedules[0].selected_date).format('YYYY-MM-DD')
                    : dayjs().format('YYYY-MM-DD')
                openScheduleView(today_schedules, dayKey)
            }, 800)
            
        }

        return () => timeout && window.clearTimeout(timeout)
    }, [])

    const listRows = useMemo(() => {
        const rows = [{ kind: 'today' }]
        if (upcoming_schedules.length !== 0) {
            rows.push({ kind: 'header', label: 'Upcoming schedule...' })
        }
        upcoming_schedules.forEach((item) => {
            rows.push({
                kind: 'schedule',
                dayKey: item.dayKey,
                date: item.displayDate,
                items: item.items,
            })
        })
        return rows
    }, [upcoming_schedules])

    const footerContent = useMemo(() => {
        if (loadingMore) return <div style={{ paddingBottom: '16px' }}>Loading more schedules...</div>
        if (loadingError) {
            return (
                <div style={{ paddingBottom: '16px' }}>
                    Failed to load more schedules.
                    {onRetry && (
                        <button type='button' onClick={onRetry} style={{ marginLeft: '8px' }}>
                            Retry
                        </button>
                    )}
                </div>
            )
        }
        if (offlineCached) return <div style={{ paddingBottom: '16px' }}>Offline: showing cached list data.</div>
        if (staleData) return <div style={{ paddingBottom: '16px' }}>Showing cached schedule data.</div>
        return null
    }, [loadingMore, loadingError, onRetry, staleData, offlineCached])

    useEffect(() => {
        if (!scrollerEl) return
        const onScroll = () => {
            const top = scrollerEl.scrollTop || 0
            if (top > 80 && !refreshArmedRef.current) {
                refreshArmedRef.current = true
            }
            if (top <= 2 && refreshArmedRef.current && onRefreshTop && !loadingMore) {
                refreshArmedRef.current = false
                setRefreshUI('refreshing')
                onRefreshTop()
            }
        }
        scrollerEl.addEventListener('scroll', onScroll, { passive: true })
        return () => scrollerEl.removeEventListener('scroll', onScroll)
    }, [scrollerEl, onRefreshTop, loadingMore, refreshing])

    useEffect(() => {
        if (refreshing) {
            setRefreshUI('refreshing')
            return
        }
        if (refreshUI === 'refreshing') {
            const timer = window.setTimeout(() => {
                setRefreshUI('hidden')
            }, 350)
            return () => window.clearTimeout(timer)
        }
    }, [refreshing, refreshUI])

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    height: '90%',
                    width: '95%',
                    paddingLeft: '5%',
                    paddingTop: '20px',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '4px',
                        left: '50%',
                        transform: refreshUI === 'refreshing' ? 'translate(-50%, 0)' : 'translate(-50%, -120%)',
                        opacity: refreshUI === 'refreshing' ? 1 : 0,
                        transition: 'all 220ms ease',
                        background: '#4ea6d8',
                        color: '#fff',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '6px 12px',
                        zIndex: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                        pointerEvents: 'none',
                    }}
                >
                    Refreshing list...
                </div>
                <Virtuoso
                    style={{ height: '100%', width: '100%' }}
                    data={listRows}
                    scrollerRef={setScrollerEl}
                    endReached={() => {
                        if (!hasMore || loadingMore || !onReachEnd) return
                        onReachEnd()
                    }}
                    components={{
                        Footer: () => footerContent,
                    }}
                    itemContent={(_, row) => {
                        if (row.kind === 'today') {
                            return (
                                <WrapperBox
                                    height={400}
                                    marginBottom={'20px'}
                                >
                                    <TodayList
                                        list={today_schedules}
                                        imageList={today_schedules_with_image}
                                        eventtypes={eventtypes}
                                        onClickHandler={openScheduleView}
                                    />
                                </WrapperBox>
                            )
                        }
                        if (row.kind === 'header') {
                            return (
                                <div style={{
                                    height: '50px',
                                    width: '100%',
                                    color: '#455295',
                                    fontWeight: '500',
                                    fontSize: '20px',
                                    paddingLeft: '5%',
                                }}>
                                    {row.label}
                                </div>
                            )
                        }
                        return (
                            <WrapperBox
                                height={150}
                                marginBottom={'6px'}
                            >
                                <ScheduleItem
                                    item={row.items}
                                    selected_date={row.date}
                                    eventtypes={eventtypes}
                                    onClickHandler={(items) => openScheduleView(items, row.dayKey)}
                                />
                            </WrapperBox>
                        )
                    }}
                />
            </div>
        </>
    )
}

export default connect(state => ({
    schedules: state.schedule.schedules,
    eventtypes: state.marker.eventtypes,
})) (ScheduleList)
