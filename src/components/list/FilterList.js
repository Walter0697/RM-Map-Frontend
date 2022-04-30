import React, { useEffect, useState, useMemo } from 'react'
import { connect } from 'react-redux'
import { Grid, Button } from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'

import EventTypeFilter from '../filter/EventTypeFilter'
import AttributeFilter from '../filter/AttributeFilter'
import NeedBookingFilter from '../filter/NeedBookingFilter'

function FilterList({
    height,
    filterlist,
}) {
    const [ selectedEventTypes, setSelectedEventTypes ] = useState([])
    const [ selectedAttribute, setSelectedAttribute ] = useState([])
    const [ bookingStatus, setBookingStatus ] = useState(null)

    const toggleEventType = (value) => {
        let prev = selectedEventTypes
        if (prev.includes(value)) {
            prev = prev.filter(s => s !== value)
        } else {
            prev.push(value)
        }
        setSelectedEventTypes(JSON.parse(JSON.stringify(prev)))
    }

    const toggleAttribute = (value) => {
        let prev = selectedAttribute
        if (prev.includes(value)) {
            prev = prev.filter(s => s !== value)
        } else {
            prev.push(value)
        }
        setSelectedAttribute(JSON.parse(JSON.stringify(prev)))
    }

    return (
        <div style={{
            height: height,
            width: '100%',
            paddingTop: '5%',
            overflow: 'hidden',
            position: 'relative',
        }}>
            <BottomUpTrail>
                <WrapperBox
                    height={'180px'}
                    marginBottom='10px'
                    isCenter
                >
                    <EventTypeFilter 
                        selectedEventTypes={selectedEventTypes}
                        toggleEventType={toggleEventType}
                    />
                </WrapperBox>
                <WrapperBox
                    height={'230px'}
                    marginBottom='10px'
                    isCenter
                >
                    <Grid container fullWidth
                        style={{
                            width: '90%',
                        }}
                    >
                        <Grid item xs={6}>
                            <div style={{
                                height: '100%',
                                width: '100%',
                            }}>
                            <AttributeFilter
                                selectedAttribute={selectedAttribute}
                                toggleAttribute={toggleAttribute}
                            />
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <div style={{
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}>
                            <NeedBookingFilter
                                bookingStatus={bookingStatus}
                                setBookingStatus={setBookingStatus}
                            />
                            </div>
                        </Grid>
                    </Grid>
                </WrapperBox>
            </BottomUpTrail>
        </div>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
    filterlist: state.filter.value,
})) (FilterList)
