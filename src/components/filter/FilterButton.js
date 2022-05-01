import React from 'react'
import { Grid } from '@mui/material'
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
}) {
    const { overlayTransform } = useSpring({
        config: config.wobbly,
        from: { 
            overlayTransform: 'scale(0, 0)',
        },
        overlayTransform: isActive ? 'scale(100%, 100%)' : 'scale(0%, 0%)',
    })

    return (
        <div style={{
            width: '100%',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
        }}>
            <div 
                style={{
                    width: '90%',
                    backgroundColor: isActive ? '' : '#33333311',
                    borderRadius: '15px',
                    position: 'relative',
                }}
                onClick={onClickHandler}
            >
                <animated.div style={{
                    position: 'absolute',
                    backgroundColor: '#9ff4ffcc',
                    width: '100%',
                    height: '100%',
                    transform: overlayTransform,
                    borderRadius: '15px',
                }}></animated.div>
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Grid container>
                        <Grid item xs={4}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                                {imageLink ? (
                                    <img
                                        style={{
                                            verticalAlign: 'middle',
                                        }}
                                        width={'30px'}
                                        src={imageLink}
                                    />
                                ) : (
                                    <>{icon}</>
                                )}
                            </div>
                        </Grid>
                        <Grid item xs={8}>
                        <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '16px',
                                fontWeight: '700',
                                height: '100%',
                            }}>
                                {text}
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </div>
    )
}

export default FilterButton