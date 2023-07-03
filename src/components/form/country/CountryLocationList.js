import React, { useMemo, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
    TextField,
} from '@mui/material'
import dayjs from 'dayjs'

import BaseForm from '../BaseForm'
import RoundImage from '../../wrapper/RoundImage'

import constant from '../../../scripts/constant'

function CountryLocationList({
    open,
    handleClose,
    mapName,
    countryPointId,
    countryPoints,
    countryLocations,
    markers,
}) {
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
        const locationList = allLocations.filter(location => location.country_point_id === currentPoint.id)

        const output = []
        for (let i = 0; i < locationList.length; i++) {
            const currentLocation = locationList[i]
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
                visitTime: dayjs(currentLocation.visit_time),
                visitTimeStr: dayjs(currentLocation.visit_time).format('YYYY-MM-DD'),
            })
        }

        const result = output.sort((a, b) => {
            return a.visitTime - b.visitTime
        })

        return result
    }, [countryLocations, currentPoint, markers])
    
    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={title}
        >
            <Grid container spacing={2}>
                {locationList.map((location, index) => (
                    <Grid key={index} item xs={12} md={12} lg={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={5}>
                                <RoundImage    
                                    width='90%'
                                    src={location.bigImage}
                                />
                            </Grid>
                            <Grid item xs={7}>
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
                                }}>{location.label}</div>
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </BaseForm>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    countryPoints: state.country.countryPoints,
    countryLocations: state.country.countryLocations,
}))(CountryLocationList)