import React, { useMemo, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    Button,
} from '@mui/material'
import dayjs from 'dayjs'

import useBoop from '../../../hooks/useBoop'

import BaseForm from '../BaseForm'
import RoundImage from '../../wrapper/RoundImage'
import MarkerView from '../../marker/MarkerView'
import CountryLocationForm from './CountryLocationForm'
import AutoHideAlert from '../../AutoHideAlert'

import constants from '../../../constant'

function CountryLocationItem({
    location,
    openMarkerPreview,
}) {
    const [ bigImage, setBigImage ] = useState(location.bigImage)
    const [ smallImage, setSmallImage ] = useState(location.smallImage)
    const [ bigImageExist, setBigImageExist ] = useState(false)
    const [ smallImageExist, setSmallImageExist ] = useState(false)

    useEffect(() => {
        if (location.bigImage) {
            setBigImageExist(true)
        } else {
            setBigImageExist(false)
        }

        if (location.smallImage) {
            setSmallImageExist(true)
        } else {
            setSmallImageExist(false)
        }
    }, [location])

    const onBigImageFailedToLoad = () => {
        if (smallImage) {
            setBigImage(smallImage)
            setSmallImage(null)
            setBigImageExist(true)
            setSmallImageExist(false)
        } else {
            setBigImageExist(false)
        }
    }

    const onSmallImageFailedToLoad = () => {
        setSmallImageExist(false)
    }

    return (
        <Grid item xs={12} md={12} lg={12} style={{
            marginTop: '50px',
        }}>
            <Grid container spacing={2}>
                {bigImageExist && (
                    <Grid item xs={5} style={{
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '0%',
                            left: '0%',
                            width: '100%',
                            height: '100%',
                        }}>
                            <RoundImage    
                                width='90%'
                                src={bigImage}
                                onError={onBigImageFailedToLoad}
                            />
                        </div>
                        
                        {smallImageExist && (
                            <div style={{
                                position: 'absolute',
                                bottom: '0%',
                                right: '0%',
                                width: '30%',
                                height: '30%',
                            }}>
                                <RoundImage
                                    width='100%'
                                    src={smallImage}
                                    onError={onSmallImageFailedToLoad}
                                />
                            </div>
                        )}
                    </Grid>
                )}
                <Grid item xs={bigImageExist ? 7 : 12}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginTop: '5px',
                    }}>
                        {location.visitTimeStr}
                    </div>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                    }}>{location.label}</div>
                    {location.markerId && (
                        <Button
                            variant="contained"
                            size="small"
                            style={{
                                backgroundColor: constants.colors.CardBackground,
                                width: '100%',
                            }}
                            onClick={() => openMarkerPreview(location.markerId)}
                        >
                            Marker
                        </Button>
                    )}
                </Grid>
            </Grid>
        </Grid>
    )
}

function CountryLocationList({
    open,
    handleClose,
    mapName,
    previousMarkers,
    countryPointId,
    countryPoints,
    countryLocations,
    markers,
}) {
    const [ openPreview, setOpenPreview ] = useState(false)
    const [ previewingMarker, setPreview ] = useState(null)

    const [ openCreate, setOpenCreate ] = useState(false)
    const [ createAlert, confirmCreated ] = useBoop(3000)

    const currentPoint = useMemo(() => {
        if (!open) return null
        return countryPoints.find(point => point.id === countryPointId)
    }, [open, countryPointId, countryPoints])

    const title = useMemo(() => {
        if (!currentPoint) return mapName
        return `${mapName} - ${currentPoint.label}`
    }, [currentPoint, mapName])

    const locationList = useMemo(() => {
        if (!currentPoint) return [] 
        const allLocations = countryLocations ?? []
        const list = allLocations.filter(location => location.country_point_id === currentPoint.id)

        const output = []
        for (let i = 0; i < list.length; i++) {
            const currentLocation = list[i]
            let bigImage = null
            let smallImage = null
            if (currentLocation.image_link) {
                bigImage = currentLocation.image_link
            }
            const currentMarker = markers.find(marker => marker.id === currentLocation.marker_id)

            if (currentMarker && currentMarker.image_link) {
                if (!bigImage) {
                    bigImage = currentMarker.image_link
                } else {
                    smallImage = currentMarker.image_link
                }
            } 
            output.push({
                id: currentLocation.id,
                label: currentLocation.label,
                bigImage: bigImage,
                smallImage: smallImage,
                markerId: currentLocation.marker_id,
                visitTime: dayjs(currentLocation.visit_time),
                visitTimeStr: dayjs(currentLocation.visit_time).format('YYYY-MM-DD'),
            })
        }

        const result = output.sort((a, b) => {
            return a.visitTime - b.visitTime
        })

        return result
    }, [countryLocations, currentPoint, markers])

    const openMarkerPreview = (markerId) => {
        const currentMarker = markers.find(marker => marker.id === markerId)
        if (currentMarker) {
            setPreview(currentMarker)
            setOpenPreview(true)
        }
    }

    const openCreateLocation = () => {
        setOpenCreate(true)
    }

    const onLocationCreated = () => {
        setOpenCreate(false)
        confirmCreated()
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={title}
                createText={'Add New'}
                handleSubmit={openCreateLocation}
            >
                <Grid container spacing={2}>
                    {locationList.map((location, index) => (
                        <CountryLocationItem
                            key={`location-${index}-${location.id}`}
                            location={location}
                            openMarkerPreview={openMarkerPreview}
                        />
                    ))}
                </Grid>
            </BaseForm>
            <MarkerView
                open={openPreview}
                handleClose={() => setOpenPreview(false)}
                marker={previewingMarker}
                noStar={true}
            />
            <CountryLocationForm 
                open={openCreate}
                handleClose={() => setOpenCreate(false)}
                previousMarkers={previousMarkers}
                countryPoint={currentPoint}
                onCreated={onLocationCreated}
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully create schedule!'}
                timing={3000}
            />
        </>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    countryPoints: state.country.countryPoints,
    countryLocations: state.country.countryLocations,
}))(CountryLocationList)