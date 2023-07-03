import React, { useEffect, useState, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import useBoop from '../../hooks/useBoop'

import RoundImage from '../wrapper/RoundImage'

import { Button } from '@mui/material'

import math from '../../scripts/generic/math'
import constant from '../../scripts/constant'

function LocationPreviewList({
    displayInfo,
    top,
    height,
    countryLocations,
    markers,
    onClick,
}) {
    const [ isBlinking, setBlink ] = useBoop(500)
    const [ imageList, setImageList ] = useState([])

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: isBlinking ? 0 : 1,
    })

    const imageHeight = useMemo(() => {
        return height * 0.6
    }, [height])

    const setRandomListImage = (list) => {
        const shuffleList = math.shuffleElement(list, 8)
        setBlink()
        setTimeout(() => {
            setImageList(shuffleList)
        }, 500)
    }

    useEffect(() => {
        if (!displayInfo) return

        let timer = null
        const photoList = []

        const currentPoint = displayInfo.info

        const allLocations = countryLocations ?? []
        const locationList = allLocations.filter(location => location.country_point_id === currentPoint.id)

        for (let i = 0; i < locationList.length; i++) {
            const currentLocation = locationList[i]
            if (currentLocation.image_link) {
                photoList.push(currentLocation.image_link)
                continue
            }
            const currentMarker = markers.find(marker => marker.id === currentLocation.marker_id)
            if (currentMarker) {
                if (currentMarker.image_link) {
                    photoList.push(currentMarker.image_link)
                }
            }
        }
        setRandomListImage(photoList)

        timer = window.setInterval(() => {
            setRandomListImage(photoList)
        }, 5000)

        return () => {
            if (timer) {
                window.clearInterval(timer)
            }
        }
    }, [displayInfo, countryLocations, markers])
    
    return (
        <Button 
            style={{
                position: 'absolute',
                top: top,
                height: height,
                left: '5%',
                width: '90%',
                backgroundColor: constant.StaticColour.CardBackground,
                border: `3px solid ${constant.StaticColour.CountryLocationBorder}`,
                borderRadius: '5px',
                color: constant.StaticColour.CountryLocationBorder,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                textTransform: 'none',
                fontSize: '16px',
                paddingTop: '1px',
                paddingLeft: '5px',
                flexDirection: 'column',
            }}
            onClick={onClick}
        >
            <div>{displayInfo.label}</div>
            <animated.div
                style={{
                    opacity: x,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                }}
            >
                {imageList.map((image, index) => (
                    <div
                        key={index}
                        style={{
                            width: imageHeight,
                            marginRight: '15px',
                        }}
                       
                    >
                        <div style={{
                            height: imageHeight,
                            width: imageHeight,
                            overflow: 'hidden',
                        }}>
                            <RoundImage 
                                height={imageHeight}
                                src={image}
                            />
                        </div>
                    </div>
                ))}
            </animated.div>
        </Button>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    countryLocations: state.country.countryLocations,
})) (LocationPreviewList)