import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Grid } from '@mui/material'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'

import EventTypeFilter from '../filter/EventTypeFilter'
import AttributeFilter from '../filter/AttributeFilter'
import NeedBookingFilter from '../filter/NeedBookingFilter'

import actions from '../../store/actions'

function FilterList({
    height,
    filterlist,
    dispatch,
}) {
    const [ init, setInit ] = useState(false)
    const [ selectedEventTypes, setSelectedEventTypes ] = useState([])
    const [ selectedAttribute, setSelectedAttribute ] = useState([])
    const [ bookingStatus, setBookingStatus ] = useState(null)

    useEffect(() => {
        if (!init) {
            if (filterlist) {
                if (filterlist.eventtypes) {
                    setSelectedEventTypes(filterlist.eventtypes)
                }
                if (filterlist.attribute) {
                    setSelectedAttribute(filterlist.attribute)
                }
                if (filterlist.booking) {
                    setBookingStatus(filterlist.booking)
                }
            }
            setInit(true)
        }
    }, [filterlist, init])

    const triggerFilterValueUpdate = (field, value) => {
        let previous_list = {}
        if (filterlist) {
            previous_list = JSON.parse(JSON.stringify(filterlist))
        }
        previous_list[field] = value
        dispatch(actions.updateFilter(previous_list))
    }

    const toggleEventType = (value) => {
        let prev = JSON.parse(JSON.stringify(selectedEventTypes))
        if (prev.includes(value)) {
            prev = prev.filter(s => s !== value)
        } else {
            prev.push(value)
        }
        setSelectedEventTypes(prev)
        triggerFilterValueUpdate('eventtypes', prev)
    }

    const toggleAttribute = (value) => {
        let prev = JSON.parse(JSON.stringify(selectedAttribute))
        if (prev.includes(value)) {
            prev = prev.filter(s => s !== value)
        } else {
            prev.push(value)
        }
        setSelectedAttribute(prev)
        triggerFilterValueUpdate('attribute', prev)
    }

    const updateBookingStatus = (value) => {
        setBookingStatus(value)
        triggerFilterValueUpdate('booking', value)
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
                                setBookingStatus={updateBookingStatus}
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
    filterlist: state.filter.list,
})) (FilterList)

// attribute -> favourite / hurry / timed DONE
// need booking -> booking / walk in DONE

// put it in code-able maybe
// estimate time -> short / medium / long
// pricing -> free / cheap / middle / expensive