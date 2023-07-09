import React, { useState, useMemo } from 'react'
import {
    useSpring,
    animated,
} from '@react-spring/web'
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
    const [flip, set] = useState(false)

    const { scroll } = useSpring({
        config: {
            mass: 50,
            tension: 280,
            friction: 300,
        },
        scroll: (list.length - 1) * 50,
        from: { scroll: 0 },
        reset: true,
        reverse: flip,
        delay: 150,
        onRest: () => set(!flip),
     })

    return (
        <Button
            style={{
                backgroundColor: constants.colors.CardBackground,
                height: '100%',
                width: '100%',
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
            }}
            onClick={onClickHandler}
        >
            <Grid container fullWidth style={{
                paddingTop: '10px',
            }}>
                Today Schedules
                <Grid item xs={12} md={12} lg={12}
                    style={{
                        height: '70px',
                        width: '100%',
                        marginTop: '10px',
                    }}
                >
                    <animated.div
                        style={{
                            height: '60px',
                            width: '100%',
                            display: 'flex',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                        }}
                        scrollLeft={scroll}
                    >
                        {list.map((schedule, index) => (
                            <div 
                                key={index}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    marginRight: '15px',
                                    zIndex: 2,
                                }}
                            >
                                <RoundImage 
                                    width={'50px'}
                                    height={'50px'}
                                    src={schedule.image_path}
                                />
                            </div>
                        ))}
                    </animated.div>
                    
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