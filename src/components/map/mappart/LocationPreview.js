import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
} from '@mui/material'
import backend from '../../../constant/backend'
import constants from '../../../constant'

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

import ImageHeadText from '../../wrapper/ImageHeadText'

import ContentPreview from './previewpart/ContentPreview'

import maphelper from '../../../scripts/map'


function LocationPreview({
    marker,
    onOpen,
    onClose,
    shouldViewContent,
    setSelectedById,
    onSelectMarker,
    eventtypes,
}) {
    const [ typeIcon, setIcon ] = useState(null)

    const displayImage = useMemo(() => {
        if (!marker) return null
        if (marker?.type === 'marker') {
            if (marker?.item.image_link) {
                return backend.IMAGE_LINK + marker.item.image_link
            } else {
                return typeIcon
            }
            return null
        } else {
            let imageValue = null
            switch (marker?.type) {
                case constants.overlay.typeStation:
                    imageValue = maphelper.sprite.getPinSprite(marker?.type, marker?.item?.map_name)
            }
            return imageValue
        }
        return null
    }, [marker, typeIcon])

    useEffect(() => {
        if (!marker) return

        if (marker?.type === 'marker') {
            // find the type icon from the list to get the icon path
            const currentType = eventtypes.find(s => s.value === marker.item.type)
            setIcon(backend.IMAGE_LINK + currentType.icon_path)
        }
    }, [marker])

    const showMarkerView = () => {
        if (marker && marker.type === 'marker') {
            if (onSelectMarker) {
                onSelectMarker(marker.item)
                return
            }
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
                <Grid
                    container
                    style={{
                        height: '100%',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                    }}
                >
                    { displayImage && (
                        <Grid item xs={4} md={4} lg={4}
                            style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    marginLeft: '10px',
                                    width: '82%',
                                    maxWidth: '96px',
                                    aspectRatio: '1 / 1',
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <img
                                    style={{
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                    }}
                                    src={displayImage}
                                />
                            </div>
                        </Grid>
                    )}
                    <ContentPreview
                        imageExist={!!displayImage}
                        typeIcon={typeIcon}
                        marker={marker}
                    />
                </Grid>
            </Grid>
        </Grid>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(LocationPreview)
