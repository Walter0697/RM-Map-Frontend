import React from 'react'
import Grid from '@mui/material/GridLegacy'
import { Tooltip } from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

function FilterButton({
    icon,
    imageLink,
    text,
    isActive,
    onClickHandler,
    showText = true,
    tooltipText = '',
}) {
    const { overlayTransform } = useSpring({
        config: config.wobbly,
        from: {
            overlayTransform: 'scale(0, 0)',
        },
        overlayTransform: isActive ? 'scale(100%, 100%)' : 'scale(0%, 0%)',
    })

    const content = (
        <div
            style={{
                width: '100%',
                height: showText ? '50px' : '44px',
                display: 'flex',
                justifyContent: 'center',
                marginTop: showText ? '10px' : '4px',
            }}
        >
            <div
                style={{
                    width: '90%',
                    backgroundColor: isActive ? '' : '#33333311',
                    borderRadius: '15px',
                    position: 'relative',
                    cursor: 'pointer',
                }}
                onClick={onClickHandler}
            >
                <animated.div
                    style={{
                        position: 'absolute',
                        backgroundColor: '#9ff4ffcc',
                        width: '100%',
                        height: '100%',
                        transform: overlayTransform,
                        borderRadius: '15px',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {showText ? (
                        <Grid container>
                            <Grid item xs={4}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {imageLink ? (
                                        <img
                                            style={{ verticalAlign: 'middle' }}
                                            width={'30px'}
                                            src={imageLink}
                                        />
                                    ) : (
                                        <>{icon}</>
                                    )}
                                </div>
                            </Grid>
                            <Grid item xs={8}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        height: '100%',
                                    }}
                                >
                                    {text}
                                </div>
                            </Grid>
                        </Grid>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            {imageLink ? (
                                <img
                                    style={{
                                        verticalAlign: 'middle',
                                        width: '30px',
                                        height: '30px',
                                        objectFit: 'contain',
                                    }}
                                    src={imageLink}
                                />
                            ) : (
                                <>{icon}</>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    if (!tooltipText) {
        return content
    }

    return (
        <Tooltip
            title={tooltipText}
            arrow
            enterTouchDelay={250}
            leaveTouchDelay={1800}
        >
            {content}
        </Tooltip>
    )
}

export default FilterButton
