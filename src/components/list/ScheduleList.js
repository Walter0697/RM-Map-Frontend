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

function ScheduleItem({
    item,
    selected_date,
    eventtypes,
    onClickHandler,
}) {
    const imageMarkers = useMemo(() => {
        if (!item) return []
        return filters.schedules.get_schedule_image(item, eventtypes)
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
            }}
            onClick={scheduleItemOnClick}
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
                        fontSize: '20px',
                        color: '#455295',
                    }}
                >
                     {selected_date}
                </Grid>
                <Grid
                    item xs={12}
                    style={{
                        height: '100px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        paddingTop: '10px',
                        fontSize: '20px',
                        color: '#455295',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                    }}
                >
                    {imageMarkers.map((sche, index) => (
                        <div key={index}
                            style={{
                                width: '80px',
                                //overflow: 'hidden',
                                marginRight: '15px',
                            }}
                        >
                            <div
                                style={{
                                    height: '80px',
                                    width: '80px',
                                    overflow: 'hidden',
                                    borderRadius: '5px',
                                }}
                            >
                                <img
                                    height='80px'
                                    src={backend.IMAGE_LINK + sche.image_path}
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
        const filteredList = list.filter(s => s.image_path)
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
    }, [list])

    const setRandomBigImageMarker = (filteredList) => {
        if (filteredList.length <= 2) {
            setBigMarkers(filteredList)
            setSmallMarkers(filteredList)
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
                        height: '280px',
                        width: '100%',
                        color: '#445295',
                    }}
                >
                    <Grid container fullWidth>
                        <Grid 
                            item xs={6}
                            style={{
                                width: '100%',
                            }}    
                        >
                            {bigImageMarkers.length >= 1 ? (
                                <>
                                    <div style={{ 
                                        width: '100%', 
                                        height: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <img 
                                            src={backend.IMAGE_LINK + bigImageMarkers[0].image_path}
                                            style={{
                                                maxHeight: '150px',
                                                width: '90%',
                                            }}
                                        />
                                    </div>
                                    {bigImageMarkers[0].label}
                                </>
                            ) : (
                                <></>
                            )}
                        </Grid>
                        <Grid 
                            item xs={6}
                            style={{
                                width: '100%',
                            }}    
                        >
                            {bigImageMarkers.length >= 2 ? (
                                <>
                                    <div style={{ 
                                        width: '100%', 
                                        height: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <img 
                                            src={backend.IMAGE_LINK + bigImageMarkers[1].image_path}
                                            style={{
                                                maxHeight: '150px',
                                                width: '90%',
                                            }}
                                        />
                                    </div>
                                    {bigImageMarkers[1].label}
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
                    {smallDisplayMarkers.map((sche, index) => (
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
                                    height='50px'
                                    src={backend.IMAGE_LINK + sche.image_path}
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

        onClickHandler(list, dayjs().format('YYYY-MM-DD'))
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
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop: '10px',
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

    const scheduleSource = schedulesOverride && schedulesOverride.length >= 0 ? schedulesOverride : schedules

    const today_schedules = useMemo(() => {
        if (!scheduleSource) return []
        return filters.schedules.get_today_image(scheduleSource, eventtypes)
    }, [scheduleSource, eventtypes])

    const upcoming_schedules = useMemo(() => {
        if (!scheduleSource) return []
        
        const upcoming_list = filters.schedules.get_upcoming(scheduleSource)
        
        // use dictionary for grouping the schedules into each day
        let result = {}
        upcoming_list.forEach((sd) => {
            const date = dayjs.utc(sd.selected_date).format('MM/DD/YYYY')
            if (date in result) {
                result[date].push(sd)
            } else {
                result[date] = [sd]
            }
        })

        // create an array with dictionary
        const result_arr = Object.entries(result)

        // sorted the array according to date
        const sorted = result_arr.sort((a, b) => {
            if (dayjs(a[0]).isAfter(dayjs(b[0]))) {
                return -1
            }
            return 1
        })

        return sorted
    }, [scheduleSource])

    useEffect(() => {
        let timeout = null
        if (location.pathname === '/schedule/open') {
            timeout = window.setTimeout(() => {
                openScheduleView(today_schedules, dayjs().format('YYYY-MM-DD'))
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
                date: item[0],
                items: item[1],
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
                console.log('[RM-PAGED][schedules_list] refresh:armed')
            }
            if (top <= 2 && refreshArmedRef.current && onRefreshTop && !loadingMore) {
                refreshArmedRef.current = false
                setRefreshUI('refreshing')
                console.log('[RM-PAGED][schedules_list] refresh:trigger')
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
                                marginBottom={'10px'}
                            >
                                <ScheduleItem
                                    item={row.items}
                                    selected_date={row.date}
                                    eventtypes={eventtypes}
                                    onClickHandler={openScheduleView}
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
