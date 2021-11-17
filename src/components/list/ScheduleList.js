import React, { useState, useEffect, useMemo } from 'react'
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

import dayjs from 'dayjs'

import useBoop from '../../hooks/useBoop'

import generic from '../../scripts/generic'

import BottomUpTrail from '../animatein/BottomUpTrail'

function ButtonBox({
    height,
    children,
  }) {
  return (
    <div style={{
      height,
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

function ScheduleItem({
    item,
    onClickHandler,
}) {
    return false
}

function TodayList({
    list,
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
        const filteredList = list.filter(s => s.marker?.image_link)
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
        if (filteredList <= 2) {
            setBigMarkers(filteredList)
            setSmallMarkers(filteredList)
        }

        let displayList = []
        const randList = generic.math.nonRepeatNumber(2, filteredList.length)
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

    const getTodayInformation = () => {
        if (!list || (list && list.length === 0)) {
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
        }
        return (
            <animated.div
                style={{
                    opacity: x,
                }}
            >
                <Grid 
                    item xs={12}
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
                                <img 
                                    src={process.env.REACT_APP_IMAGE_LINK + bigImageMarkers[0].marker.image_link}
                                    width='100%'
                                />
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
                                <img 
                                    src={process.env.REACT_APP_IMAGE_LINK + bigImageMarkers[1].marker.image_link}
                                    width='100%'
                                />
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
                        <div key={index}>
                            <img 
                                height='50px'
                                src={process.env.REACT_APP_IMAGE_LINK + sche.marker.image_link}
                            />
                        </div>
                    ))}
                </Grid>
            </animated.div>
        )
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
            onClick={() => {}}
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
    schedules,
}) {
    const today_schedules = useMemo(() => {
        if (!schedules) return []
        const now = dayjs().format('YYYY-MM-DD')
        return schedules.filter(s => dayjs(s.selected_date).format('YYYY-MM-DD') === now)
    }, [schedules])

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    height: '90%',
                    width: '95%',
                    paddingLeft: '5%',
                    paddingTop: '20px',
                    overflow: 'auto',
                }}
            >
                <BottomUpTrail>
                    <ButtonBox
                        height={350}
                    >
                        <TodayList
                            list={today_schedules}
                        />
                    </ButtonBox>
                </BottomUpTrail>
            </div>
        </>
    )
}

export default connect(state => ({
    schedules: state.schedule.schedules,
})) (ScheduleList)