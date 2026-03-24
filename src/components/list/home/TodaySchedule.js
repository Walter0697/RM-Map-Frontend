import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import TodayIcon from '@mui/icons-material/Today'

import constants from '../../../constant'
import RoundImage from '../../wrapper/RoundImage'
function TodaySchedule({
    list,   // an array of string containning image link
    onClickHandler,
}) {
    const [displayOffset, setDisplayOffset] = useState(0)
    const [contentOpacity, setContentOpacity] = useState(1)
    const cycleTimerRef = useRef(null)
    const fadeDurationMs = 1000

    useEffect(() => {
        if (!Array.isArray(list) || list.length <= 1) {
            setDisplayOffset(0)
            return
        }

        const intervalId = window.setInterval(() => {
            setContentOpacity(0)
            cycleTimerRef.current = window.setTimeout(() => {
                setDisplayOffset((prev) => (prev + 1) % list.length)
                window.requestAnimationFrame(() => {
                    setContentOpacity(1)
                })
            }, fadeDurationMs)
        }, 5000)

        return () => {
            window.clearInterval(intervalId)
            if (cycleTimerRef.current) {
                window.clearTimeout(cycleTimerRef.current)
                cycleTimerRef.current = null
            }
        }
    }, [list, fadeDurationMs])

    const rotatedList = useMemo(() => {
        if (!Array.isArray(list) || list.length === 0) return []
        if (displayOffset === 0) return list
        return [
            ...list.slice(displayOffset),
            ...list.slice(0, displayOffset),
        ]
    }, [list, displayOffset])

    return (
        <Button
            style={{
                backgroundColor: constants.colors.CardBackground,
                height: '100%',
                width: '100%',
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
            }}
            onClick={onClickHandler}
        >
            <Grid container fullWidth style={{
                paddingTop: '10px',
                textAlign: 'left',
            }}>
                <Grid item xs={12} style={{ paddingLeft: '8px', fontWeight: 500 }}>
                    Today Schedules
                </Grid>
                <Grid item xs={12} md={12} lg={12}
                    style={{
                        height: '70px',
                        width: '100%',
                        marginTop: '10px',
                        paddingLeft: '8px',
                    }}
                >
                    <div
                        style={{
                            height: '60px',
                            width: '100%',
                            display: 'flex',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            opacity: contentOpacity,
                            transition: `opacity ${fadeDurationMs}ms ease-in-out`,
                            willChange: 'opacity',
                        }}
                    >
                        {rotatedList.map((schedule, index) => (
                            <div 
                                key={index}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    marginRight: '12px',
                                    zIndex: 2,
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    backgroundColor: '#d9e6f3',
                                }}
                            >
                                <RoundImage 
                                    width={'44px'}
                                    height={'44px'}
                                    src={schedule.image_path}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        ))}
                    </div>
                    
                </Grid>
            </Grid>
            <div style={{
                position: 'absolute',
                left: '90%',
                top: '65%',
                scale: '3.8',
                transform: 'rotate(343deg)',
                zIndex: 1,
            }}>
                <TodayIcon sx={{ color: constants.colors.HomeButtonIcon }} />
            </div>
        </Button>
    )
}

export default TodaySchedule
