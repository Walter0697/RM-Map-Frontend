import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import useBoop from '../../../hooks/useBoop'

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms'
import UnarchiveIcon from '@mui/icons-material/Unarchive'
import CasinoIcon from '@mui/icons-material/Casino'
import FlashOnIcon from '@mui/icons-material/FlashOn'

import LocationOnIcon from '@mui/icons-material/LocationOn'

import RoundImage from '../../wrapper/RoundImage'

import dayjs from 'dayjs'

import constants from '../../../constant'
import actions from '../../../store/actions'
import markerhelper from '../../../scripts/marker'

const featureHomeIdentifier = 'home'

const featureTypeList = [
    {
        label: 'Featured',
        identifier: featureHomeIdentifier,
    },
    {
        label: 'Restaurant',
        identifier: constants.identifiers.featureMarkerRestaurant,
    },
    {
        label: 'Upcoming',
        identifier: constants.identifiers.featureMarkerUpcoming,
    },
    {
        label: 'Old Record',
        identifier: constants.identifiers.featureMarkerLongTimeCreated,
    },
    {
        label: 'Feeling Lucky',
        identifier: constants.identifiers.featureMarkerFeelingLucky,
    },
    {
        label: 'Short Time',
        identifier: constants.identifiers.featureMarkerShortTime,
    }
]

function FeaturedIcon({
    identifier,
}) {
    switch(identifier) {
        case featureHomeIdentifier:
            return (
                <AutoAwesomeIcon sx={{ marginRight: '10px' }} />
            )
        case constants.identifiers.featureMarkerRestaurant:
            return (
                <FastfoodIcon sx={{ marginRight: '10px' }} />
            )
        case constants.identifiers.featureMarkerUpcoming:
            return (
                <AccessAlarmsIcon sx={{ marginRight: '10px' }} />
            )
        case constants.identifiers.featureMarkerLongTimeCreated:
            return (
                <UnarchiveIcon sx={{ marginRight: '10px' }} />
            )
        case constants.identifiers.featureMarkerFeelingLucky:
            return (
                <CasinoIcon sx={{ marginRight: '10px' }} />
            )
        case constants.identifiers.featureMarkerShortTime:
            return (
                <FlashOnIcon sx={{ marginRight: '10px' }} />
            )
        default:
            return null
    }

    return false
}

function FeatureMarkPreview({
    marker,
    image,
    onClickHandler,
}) {
    return (
        <div onClick={onClickHandler} style={{
            cursor: 'pointer',
        }}>
            <RoundImage src={image} width={'100%'}/>
            <div style={{
                marginBottom: '10px',
                fontWeight: 'bold',
            }}>{marker.label}</div>
            <div style={{
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
            }}><LocationOnIcon />{marker.country_part}</div>
        </div>
    )
}

function FeatureMarkerItem({
    onClickHandler,
    markers,
    eventtypes,
    suggested,
    updated_date,
    dispatch,
}) {
    const [ topBarSelected, setTopBarSelected ] = useState(featureHomeIdentifier)
    const [ selected, setSelected ] = useState(featureHomeIdentifier)
    const [ isBlinking, setBlink ] = useBoop(500)

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: isBlinking ? 0 : 1,
    })

    const setSelectType = (identifier) => {
        if (identifier === selected) return
        setBlink()
        window.setTimeout(() => {
            setSelected(identifier)
        }, 500)
    }

    const setTopBar = (identifier) => {
        if (identifier === topBarSelected) return
        if (identifier === selected) return
        setTopBarSelected(identifier)
    }

    useEffect(() => {
        if (!topBarSelected) return
        if (topBarSelected !== selected) {
            setSelectType(topBarSelected)
        }
    }, [topBarSelected, selected])

    const isTypeSelected = (item) => {
        return item.identifier === topBarSelected
    }

    const getFeaturedMarkers = (markers, eventtypes) => {
        const filtered_markers = markerhelper.find.suggest(markers, eventtypes)

        const featured_list = markerhelper.find.feature_list(filtered_markers)
        const output = {
            [featureHomeIdentifier]: featured_list,
        }

        for (let i = 0; i < featureTypeList.length; i++) {
            if (featureTypeList[i].identifier === featureHomeIdentifier) continue
            const featuredList = markerhelper.find.feature_list_by_type(filtered_markers, featureTypeList[i].identifier)
            output[featureTypeList[i].identifier] = featuredList
        }

        return output
    }

    const featuredMarkers = useMemo(() => {
        if (suggested && dayjs().format('YYYY-MM-DD') === updated_date) {
            return suggested
        } 

        if (!markers || (markers && markers.length === 0)) return []
        if (!eventtypes) return []
        const featuredList = getFeaturedMarkers(markers, eventtypes)

        dispatch(actions.resetHomeFeatured(featuredList))
        return featuredList
    }, [suggested, markers, eventtypes])

    const currentList = useMemo(() => {
        if (!featuredMarkers) return []
        const output = []
        for (let i = 0; i < featuredMarkers[selected].length; i++) {
            const item = {
                ...featuredMarkers[selected][i],
                image: markerhelper.image.marker_image(featuredMarkers[selected][i].marker, eventtypes),
            }
            output.push(item)
        }
        return output
    }, [featuredMarkers, selected])

    const currentShowCategory = useMemo(() => {
        const output = []
        for (let i = 0; i < featureTypeList.length; i++) {
            const current = featureTypeList[i]
            if (current.identifier === featureHomeIdentifier) {
                output.push(current)
                continue
            }

            if (featuredMarkers[current.identifier].length > 0) {
                output.push(current)
            }
        }
        return output
    }, [currentList])

    const leftList = useMemo(() => {
        return currentList.slice(0, Math.ceil(currentList.length / 2))
    }, [currentList])

    const rightList = useMemo(() => {
        return currentList.slice(Math.ceil(currentList.length / 2))
    }, [currentList])

    return (
        <div style={{
            height: '100%',
            width: '100%',
        }}>
            <div style={{
                padding: '5px',
                color: constants.colors.HomeTitleFontColor,
                fontWeight: 'bold',
                marginBottom: '10px',
            }}>
                You might like this:
            </div>
            <div style={{
                height: '50px',
                width: '100%',
                overflow: 'auto',
                display: 'flex',
            }}>
                {currentShowCategory.map((item, index) => (
                    <div 
                        key={`${index}-${item.identifier}`}
                        style={{
                            width: 'auto',
                            height: '30px',
                            border: `1px solid ${isTypeSelected(item) ? constants.colors.FeatureButtonSelectedFont : constants.colors.HomeTitleFontColor}`,
                            color: isTypeSelected(item) ? constants.colors.FeatureButtonSelectedFont : constants.colors.HomeTitleFontColor,
                            backgroundColor: isTypeSelected(item) ? constants.colors.FeatureButtonSelected : constants.colors.CardBackground,
                            borderRadius: '5px',
                            padding: '5px',
                            fontSize: '15px',
                            whiteSpace: 'nowrap',
                            marginRight: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        onClick={() => setTopBar(item.identifier)}
                    >
                        <FeaturedIcon identifier={item.identifier} />
                        {item.label}
                    </div>
                ))}
            </div>
            <animated.div 
                style={{
                    opacity: x,
                    display: 'flex',
                    width: '100%',
                    height: 'auto',
                }}
            >
                <div style={{
                    width: '50%',
                    padding: '5px',
                    color: constants.colors.HomeTitleFontColor,
                }}>
                    {leftList.map((item, index) => (
                        <FeatureMarkPreview 
                            key={`left-${index}`}
                            marker={item.marker}
                            image={item.image}
                            onClickHandler={() => onClickHandler(item.marker)}
                        />
                    ))} 

                </div>
                 <div style={{
                    width: '50%',
                    padding: '5px',
                    color: constants.colors.HomeTitleFontColor,
                }}>
                     {rightList.map((item, index) => (
                        <FeatureMarkPreview 
                            key={`right-${index}`}
                            marker={item.marker}
                            image={item.image}
                            onClickHandler={() => onClickHandler(item.marker)}
                        />
                    ))} 
                </div>
            </animated.div>
        </div>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
    suggested: state.home.suggested,
    updated_date: state.home.updated_date,
})) (FeatureMarkerItem)