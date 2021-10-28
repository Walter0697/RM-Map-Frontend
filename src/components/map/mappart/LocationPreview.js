import React, { useState, useEffect } from 'react'
import {
    Grid,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'

import CircleIconButton from '../../field/CircleIconButton'

function LocationPreview({
    marker,
    onOpen,
    onClose,
    shouldViewContent,
    setSelectedById,
}) {
    const [ imageExist, setImageExist ] = useState(false)
    const {
        buttonOpacity,
    } = useSpring({
        config: config.slow,
        from: {
            buttonOpacity: 0,
        },
        to: {
            buttonOpacity: ( shouldViewContent ) ? 1 : 0,
        }
    })

    useEffect(() => {
        if (marker?.image_link) {
            setImageExist(true)
        } else {
            setImageExist(false)
        }
    }, [marker])

    const onImageFailedToLoad = (e) => {
        setImageExist(false)
    }

    const showMarkerView = () => {
        if (marker) {
            setSelectedById(marker.id)
        }
    }

    if (!marker) return false

    if (!shouldViewContent) {
        return (
            <Grid
                container
                style={{
                    height: '100%',
                    width: '100%',
                    background: '#c3c9c9',
                    boxShadow: '0px -1px 6px 0px',
                }}
            >
                <Grid
                    item xs={12}
                    alignItems='center'
                    justifyContent='center'
                    style={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                    }}
                    onClick={onOpen}
                >
                    <ArrowDropUpIcon style={{ color: '#808080' }}/>
                </Grid>
            </Grid>
        )
    }

    return (
        <Grid
            container
            style={{
                height: '100%',
                width: '100%',
                background: '#c3c9c9',
                boxShadow: '0px -1px 6px 0px',
            }}
        >
            <Grid
                item xs={12}
                alignItems='center'
                justifyContent='center'
                style={{
                    display: 'flex',
                    height: '25%',
                    width: '100%',
                }}
                onClick={onClose}
            >
                 <ArrowDropDownIcon style={{ color: '#808080' }}/>
            </Grid>
            <Grid 
                item xs={12}
                style={{
                    height: '75%',
                    width: '100%',
                }}    
            >
                <Grid container>
                    { imageExist && (
                        <Grid item xs={4} md={4} lg={4}>
                            <img 
                                style={{
                                    marginLeft: '10px',
                                }}
                                width='80%'
                                src={process.env.REACT_APP_IMAGE_LINK + marker.image_link}
                                onError={onImageFailedToLoad}
                            />
                        </Grid>
                    )}
                    <Grid 
                        item 
                        xs={imageExist ? 8 : 12} 
                        md={imageExist ? 8 : 12} 
                        lg={imageExist ? 8 : 12} 
                        style={{
                            paddingLeft: '20px',
                            paddingRight: '20px',
                        }}  
                    >
                        <Grid container>
                            <Grid 
                                item xs={12}
                                style={{
                                    fontSize: '18px',
                                    color: '#002a89',
                                    fontWeight: '500',
                                }}    
                            >
                                {marker.label}
                            </Grid>
                            <Grid 
                                item xs={12}
                                style={{
                                    fontSize: '15px',
                                    color: 'grey',
                                }}
                            >
                                {marker.address}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <animated.div
                style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '15px',
                    opacity: buttonOpacity,
                }}
            >
                <CircleIconButton
                    onClick={showMarkerView}
                >
                    <OpenInFullIcon />
                </CircleIconButton>
            </animated.div>
        </Grid>
    )
}

export default LocationPreview