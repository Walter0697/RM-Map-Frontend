import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { Grid } from '@mui/material'

import TopBar from '../components/topbar/TopBar'
import WrapperBox from '../components/wrapper/WrapperBox'
import ImageHeadText from '../components/wrapper/ImageHeadText'
import Base from './Base'

function FilterTitle({
    title,
}) {
    return (
        <div
            style={{
                fontSize: '15px',
                marginBottom: '5px',
                width: '100%',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            {title}
        </div>
    )
}

function FilterBorder() {
    return (
        <div
            style={{
                height: '1px',
                display: 'block',
                background: 'linear-gradient(to right,  rgba(0,0,0,0) 0%,rgba(147,147,147,1) 40%,rgba(147,147,147,1) 60%,rgba(0,0,0,0) 100%)',
                marginBottom: '5px',
            }}
        />
    )
}

function MarkerFilterPage({
    filterlist,
    eventtypes,
}) {
    const [ selectedEventTypes, setSelectedEventTypes ] = useState([])

    const displayEventTypes = useMemo(() => {
        return eventtypes.filter(s => !s.hidden).map(s => ({
            icon: process.env.REACT_APP_IMAGE_LINK + s.icon_path,
            label: s.label,
            value: s.value,
        }))
    }, [eventtypes])

    const toggleEventType = (value) => {
        let prev = selectedEventTypes
        if (prev.includes(value)) {
            prev = prev.filter(s => s !== value)
        } else {
            prev.push(value)
        }
        setSelectedEventTypes(JSON.parse(JSON.stringify(prev)))
    }

    useEffect(() => {
        console.log(displayEventTypes)
    }, [displayEventTypes])

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/markers')}
                label='Marker Filter'
            />
            <div style={{
                height: '90%',
                width: '100%',
                paddingTop: '5%',
                overflow: 'hidden',
                position: 'relative',
            }}>
                <WrapperBox
                    height={'200px'}
                    marginBottom='10px'
                    isCenter
                >
                    <div style={{
                        height: '100%',
                        width: '90%',
                        backgroundColor: '#83c0ff',
                        color: '#0808c1',
                        borderRadius: '5px',
                        padding: '10px',
                        boxShadow: '2px 2px 6px',
                    }}>
                        <FilterTitle 
                            title={'Event Types'}
                        />
                        <FilterBorder />
                        <Grid container fullWidth
                            style={{
                                marginTop: '5%',
                                height: '80%',
                                width: '100%',
                            }}
                        >
                            {displayEventTypes.map((item, index) => (
                                <Grid item
                                    xs={4}
                                    fullWidth
                                    key={index}
                                    style={{
                                        padding: '4px',
                                        height: '40px',
                                    }}    
                                >
                                    <div 
                                        style={{
                                            height: '100%',
                                            width: '100%',
                                            backgroundColor: selectedEventTypes.includes(item.value) ? '#21cebd' : '#bcddda',
                                            border: selectedEventTypes.includes(item.value) ? 'thin solid #1ca4ff' : 'thin solid black',
                                            borderRadius: '5px',
                                            paddingTop: '2px',
                                            paddingLeft: '2px',
                                        }}
                                        onClick={() => toggleEventType(item.value)}
                                    >
                                        <ImageHeadText
                                            iconPath={item.icon}
                                            iconSize='20px'
                                            label={item.label}
                                            labelSize='12px'
                                        />
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                </WrapperBox>
            </div>
        </Base>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
    filterlist: state.filter.value,
})) (MarkerFilterPage)