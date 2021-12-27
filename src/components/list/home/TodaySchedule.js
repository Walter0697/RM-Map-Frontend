import React, { useState } from 'react'
import {
    useSpring,
    animated,
} from '@react-spring/web'
import {
    Grid,
    Button,
} from '@mui/material'

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
            variant='contained'
            size='large'
            style={{
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
            }}
            onClick={onClickHandler}
        >
            <Grid container fullWidth>
                <Grid 
                    item xs={12} md={12} lg={12}
                    style={{
                        color: '#1c76d2',
                    }}
                >
                    Today Schedules
                </Grid>
                <Grid item xs={12} md={12} lg={12}
                    style={{
                        height: '70px',
                        width: '100%',
                    }}
                >
                    <animated.div
                        style={{
                            height: '100px',
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
                                    overflow: 'hidden',
                                    marginRight: '15px',
                                }}
                            >
                                <img 
                                    height='50px'
                                    src={process.env.REACT_APP_IMAGE_LINK + schedule.image_path}
                                />
                            </div>
                        ))}
                    </animated.div>
                    
                </Grid>
            </Grid>
        </Button>
    )
}

export default TodaySchedule