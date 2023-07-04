import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
} from '@mui/material'

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

import ContentPreview from './previewpart/ContentPreview'

import maphelper from '../../../scripts/map'
import constants from '../../../constant'

function LocationPreview({
    marker,
    onOpen,
    onClose,
    shouldViewContent,
    setSelectedById,
    eventtypes,
}) {
    const [ typeIcon, setIcon ] = useState(null)

    const displayImage = useMemo(() => {
        if (!marker) return null
        if (marker?.type === 'marker') {
            if (marker?.item.image_link) {
                return constants.BackendImageLink + marker.item.image_link
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

        if (marker?.type === 'marker') {
            // find the type icon from the list to get the icon path
            const currentType = eventtypes.find(s => s.value === marker.item.type)
            setIcon(constants.BackendImageLink + currentType.icon_path)
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
        </Grid>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(LocationPreview)