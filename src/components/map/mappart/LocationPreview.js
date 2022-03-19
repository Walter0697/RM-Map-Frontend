import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
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
import ImageHeadText from '../../wrapper/ImageHeadText'

import maphelper from '../../../scripts/map'
import constants from '../../../constant'

function MarkerPreview({
    imageExist,
    typeIcon,
    label,
    address
}) {
    return (
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
                        display: 'flex',
                    }}
                >
                    <ImageHeadText
                        iconPath={typeIcon}
                        iconSize='25px'
                        label={label}
                        labelSize='18px'
                        labelColor='#002a89'
                        labelBold
                    />
                </Grid>
                <Grid 
                    item xs={12}
                    style={{
                        fontSize: '15px',
                        color: 'grey',
                    }}
                >
                    {address}
                </Grid>
            </Grid>
        </Grid>
    )
}

function StationPreview({
    imageExist,
    localName,
    label,
}) {
    return (
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
                    }}
                >
                    {localName}
                </Grid>
                <Grid 
                    item xs={12}
                    style={{
                        fontSize: '15px',
                        color: 'grey',
                    }}
                >
                    {label}
                </Grid>
            </Grid>
        </Grid>
    )
}

function ContentPreview({
    imageExist,
    typeIcon,
    marker
}) {
    if (!marker) return false
    if (marker?.type === 'marker') {
        return (
            <MarkerPreview
                imageExist={imageExist}
                typeIcon={typeIcon}
                label={marker?.item?.label}
                address={marker?.item?.address}
            />
        )
    } else if (marker?.type === constants.overlay.station.HKMTR) {
        return (
            <StationPreview
                imageExist={imageExist}
                localName={marker?.item?.local_name}
                label={marker?.item?.label}
            />
        )
    }
    return false
}

function LocationPreview({
    marker,
    onOpen,
    onClose,
    shouldViewContent,
    setSelectedById,
    eventtypes,
}) {
    const [ typeIcon, setIcon ] = useState(null)

    // const {
    //     buttonOpacity,
    // } = useSpring({
    //     config: config.slow,
    //     from: {
    //         buttonOpacity: 0,
    //     },
    //     to: {
    //         buttonOpacity: ( shouldViewContent ) ? 1 : 0,
    //     }
    // })

    const displayImage = useMemo(() => {
        if (!marker) return null
        if (marker?.type === 'marker') {
            if (marker?.item.image_link) {
                return process.env.REACT_APP_IMAGE_LINK + marker.item.image_link
            } else {
                return typeIcon
            }
            return null
        } else {
            const image = maphelper.sprite.getPinSprite(marker?.type) 
            return image
        }
        return null
    }, [marker, typeIcon])

    useEffect(() => {
        if (!marker) return

        console.log(marker)
        if (marker?.type === 'marker') {
            // find the type icon from the list to get the icon path
            const currentType = eventtypes.find(s => s.value === marker.item.type)
            setIcon(process.env.REACT_APP_IMAGE_LINK + currentType.icon_path)

            // see if marker has a preview image
        }
    }, [marker])

    const showMarkerView = () => {
        if (marker && marker.type === 'marker') {
            setSelectedById(marker?.item.id)
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
                onClick={showMarkerView}
            >
                <Grid container>
                    { displayImage && (
                        <Grid item xs={4} md={4} lg={4}>
                            <img 
                                style={{
                                    marginLeft: '10px',
                                }}
                                width='80%'
                                src={displayImage}
                            />
                        </Grid>
                    )}
                    <ContentPreview
                        imageExist={!!displayImage}
                        typeIcon={typeIcon}
                        marker={marker}
                    />
                </Grid>
            </Grid>
            {/* <animated.div
                style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '15px',
                    opacity: buttonOpacity,
                }}
            >
                <CircleIconButton
                    onClickHandler={showMarkerView}
                >
                    <OpenInFullIcon />
                </CircleIconButton>
            </animated.div> */}
        </Grid>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(LocationPreview)