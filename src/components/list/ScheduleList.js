import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import { 
    Grid,
    Button,
} from '@mui/material'

import useBoop from '../../hooks/useBoop'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'
import AutoUpdateTop from './AutoUpdateTop'

import generic from '../../scripts/generic'
import filters from '../../scripts/filter'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

const loadingBoxHeight = 300

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
                                overflow: 'hidden',
                                marginRight: '15px',
                            }}
                        >
                            <img
                                height='80px'
                                src={process.env.REACT_APP_IMAGE_LINK + sche.image_path}
                            />
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
                        height: '230px',
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
                                            src={process.env.REACT_APP_IMAGE_LINK + bigImageMarkers[0].image_path}
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
                                            src={process.env.REACT_APP_IMAGE_LINK + bigImageMarkers[1].image_path}
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
                        overflowY: 'auto',
                    }}
                >
                    {smallDisplayMarkers.map((sche, index) => (
                        <div 
                            key={index}
                            style={{
                                width: '50px',
                                overflow: 'hidden',
                            }}
                        >
                            <img 
                                height='50px'
                                src={process.env.REACT_APP_IMAGE_LINK + sche.image_path}
                            />
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
}) {
    // generic utility
    const location = useLocation()

    const listRef = useRef(null)
    const itemListRef = useRef(null)

    const [ bottomPaddingBox, setPaddingHeight ] = useState(0)

    const today_schedules = useMemo(() => {
        if (!schedules) return []
        return filters.schedules.get_today_image(schedules, eventtypes)
    }, [schedules, eventtypes])

    const upcoming_schedules = useMemo(() => {
        if (!schedules) return []
        
        const upcoming_list = filters.schedules.get_upcoming(schedules)
        
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
            if (dayjs(a[0]).isAfter(dayjs[b[0]])) {
                return -1
            }
            return 1
        })

        return sorted
    }, [schedules])

    useEffect(() => {
        let timeout = null
        if (location.pathname === '/schedule/open') {
            timeout = window.setTimeout(() => {
                openScheduleView(today_schedules, dayjs().format('YYYY-MM-DD'))
            }, 800)
            
        }

        return () => timeout && window.clearTimeout(timeout)
    }, [])

    return (
        <>
            <div
                ref={listRef}
                style={{
                    position: 'absolute',
                    height: '90%',
                    width: '95%',
                    paddingLeft: '5%',
                    paddingTop: '20px',
                    overflow: 'auto',
                }}
            >
                <AutoUpdateTop
                    topHeight={loadingBoxHeight}
                    items={schedules}
                    listRef={listRef}
                    itemListRef={itemListRef}
                    setBottomPaddingHeight={setPaddingHeight}
                />
                <div ref={itemListRef}>
                    <BottomUpTrail>
                        <WrapperBox
                            height={350}
                            marginBottom={'20px'}
                        >
                            <TodayList
                                list={today_schedules}
                                onClickHandler={openScheduleView}
                            />
                        </WrapperBox>

                        {upcoming_schedules.length !== 0 && (
                            <div style={{
                                height: '50px',
                                width: '100%',
                                color: '#455295',
                                fontWeight: '500',
                                fontSize: '20px',
                                paddingLeft: '5%',
                            }}> 
                                Upcoming schedule...
                            </div>
                        )}
                        
                        {upcoming_schedules.map((item, index) => (
                            <WrapperBox
                                key={index}
                                height={150}
                                marginBottom={'10px'}
                            >
                                <ScheduleItem 
                                    item={item[1]}
                                    selected_date={item[0]}
                                    eventtypes={eventtypes}
                                    onClickHandler={openScheduleView}   
                                />
                            </WrapperBox>
                        ))}
                    </BottomUpTrail>
                </div>
                <div
                    style={{
                    height: bottomPaddingBox,
                    width: '100%',
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