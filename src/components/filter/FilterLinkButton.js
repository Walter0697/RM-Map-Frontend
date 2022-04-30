import React, { useState, useEffect, useMemo } from 'react'
import { Grid } from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

function FilterLinkButton({
    buttonList,
    currentStatus,
    onClickHandler,
}) {   
    const [ prevTop, setPrevTop ] = useState('10px')
    const [ currentOverlayTop, setCurrentOverlayTop ] = useState('10px')

    useEffect(() => {
        if (currentStatus) {
            const currentObj = buttonList.find(s => s.value === currentStatus)
            if (currentObj) {
                const currentIndex = buttonList.indexOf(currentObj)
                const top = (currentIndex * 50 + 10 * (currentIndex + 1)) + 'px'
                setCurrentOverlayTop(top)
                setPrevTop(top)
                return
            }
        }
        setCurrentOverlayTop(prevTop)
    }, [currentStatus, buttonList])

    const containerHeight = useMemo(() => {
        return buttonList.length * 60
    }, [buttonList])
    
    const { overlayTransform, overlayTop } = useSpring({
        config: config.wobbly,
        from: {
            overlayTransform: 'scale(0, 0)',
        },
        overlayTransform: currentStatus ? 'scale(100%, 100%)' : 'scale(0%, 0%)',
        overlayTop: currentOverlayTop,
    })

    return (
        <div style={{
            width: '100%',
            height: containerHeight,
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
        }}>
            <animated.div style={{
                position: 'absolute',
                backgroundColor: '#9ff4ffcc',
                top: overlayTop,
                width: '90%',
                height: '50px',
                transform: overlayTransform,
                borderRadius: '15px',
            }}></animated.div>
            
            {buttonList.map((option, index) => (
                <div
                    key={index}
                    style={{
                        top: index * 50 + 10 * (index + 1),
                        width: '90%',
                        height: '50px',
                        backgroundColor: '#33333311',
                        borderRadius: '15px',
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    onClick={() => onClickHandler(option.value)}
                >
                    <Grid container>
                        <Grid item xs={4}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                                {option.icon}
                            </div>
                        </Grid>
                        <Grid item xs={8}>
                        <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '16px',
                                fontWeight: '700',
                            }}>
                                {option.text}
                            </div>
                        </Grid>
                    </Grid>
                </div>
            ))}
        </div>
    )
}

export default FilterLinkButton