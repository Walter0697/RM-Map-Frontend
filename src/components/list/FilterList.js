import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Grid } from '@mui/material'

import BottomUpTrail from '../animatein/BottomUpTrail'
import WrapperBox from '../wrapper/WrapperBox'
import CircleIconButton from '../field/CircleIconButton'

import FreeTextFilter from '../filter/FreeTextFilter'
import EventTypeFilter from '../filter/EventTypeFilter'
import AttributeFilter from '../filter/AttributeFilter'
import NeedBookingFilter from '../filter/NeedBookingFilter'
import HashtagFilter from '../filter/HashtagFilter'
import ScriptFilter from '../filter/ScriptFilter'
import SortFilter from '../filter/SortFilter'

import ClearRoundedIcon from '@mui/icons-material/ClearRounded'

import FreeTextEdit from '../form/filter/FreeTextEdit'
import HashtagEdit from '../form/filter/HashtagEdit'
import ScriptEdit from '../form/filter/ScriptEdit'
import SortEdit from '../form/filter/SortEdit'

import actions from '../../store/actions'

function FilterList({
    height,
    filterlist,
    dispatch,
}) {    
    const [ init, setInit ] = useState(false)
    const [ freeTextValue, setFreeTextValue ] = useState('')
    const [ selectedEventTypes, setSelectedEventTypes ] = useState([])
    const [ selectedAttribute, setSelectedAttribute ] = useState([])
    const [ bookingStatus, setBookingStatus ] = useState(null)
    const [ selectedHashtag, setSelectedHashtag ] = useState([])
    const [ currentScript, setCurrentScript ] = useState('')
    const [ currentSort, setCurrentSort ] = useState([])

    const [ freeTextOpen, setFreeTextOpen ] = useState(false)
    const [ hashtagOpen, setHashtagOpen ] = useState(false)
    const [ scriptOpen, setScriptOpen ] = useState(false)
    const [ sortOpen, setSortOpen ] = useState(false)

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
                if (filterlist.hashtag) {
                    setSelectedHashtag(filterlist.hashtag)
                }
                if (filterlist.script) {
                    setCurrentScript(filterlist.script)
                }
                if (filterlist.sort) {
                    setCurrentSort(filterlist.sort)
                }
            }
            setInit(true)
        }
        if (filterlist.freetext) {
            setFreeTextValue(filterlist.freetext)
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

    const updateFreeText = (value) => {
        setFreeTextValue(value)
        triggerFilterValueUpdate('freetext', value)
        setFreeTextOpen(false)
    }

    const updateHashtag = (value) => {
        setSelectedHashtag(value)
        triggerFilterValueUpdate('hashtag', value)
        setHashtagOpen(false)
    }

    const updateScript = (value) => {
        setCurrentScript(value)
        triggerFilterValueUpdate('script', value)
        setScriptOpen(false)
    }

    const updateSort = (value) => {
        setCurrentSort(value)
        triggerFilterValueUpdate('sort', value)
        setSortOpen(false)
    }

    const clearAllFilter = () => {
        dispatch(actions.updateFilter({}))
        setFreeTextValue('')
        setSelectedEventTypes([])
        setSelectedAttribute([])
        setBookingStatus(null)
        setSelectedHashtag([])
        setCurrentScript('')
        setCurrentSort([])
    }

    return (
        <div style={{
            height: height,
            width: '100%',
            paddingTop: '10%',
            paddingBottom: '10%',
            overflowY: 'hidden',
            position: 'relative',
        }}>
            <div style={{
                height: '100%',
                width: '100%',
                paddingBottom: '10%',
                overflowY: 'auto',
                position: 'absolute',
            }}>
                <BottomUpTrail>
                    <WrapperBox
                        height={'100px'}
                        marginBottom='10px'
                        isCenter
                    >
                        <FreeTextFilter 
                            label={freeTextValue}
                            openLabelModal={() => setFreeTextOpen(true)}
                        />
                    </WrapperBox>
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
                        height={'100px'}
                        marginBottom='10px'
                        isCenter
                    >
                        <SortFilter 
                            sortList={currentSort}
                            openSortModel={() => setSortOpen(true)}
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
                    <WrapperBox
                        height={'100px'}
                        marginBottom='10px'
                        isCenter
                    >
                        <HashtagFilter 
                            selectedHashtag={selectedHashtag}
                            openHashtagModal={() => setHashtagOpen(true)}
                        />
                    </WrapperBox>
                    <WrapperBox
                        height={'150px'}
                        marginBottom='10px'
                        isCenter
                    >
                        <ScriptFilter 
                            scripts={currentScript}
                            openScriptModal={() => setScriptOpen(true)}
                        />
                    </WrapperBox>
                </BottomUpTrail>
            </div>
            <FreeTextEdit
                open={freeTextOpen}
                handleClose={() => setFreeTextOpen(false)}
                text={freeTextValue}
                onConfirm={updateFreeText}
            />
            <HashtagEdit 
                open={hashtagOpen}
                handleClose={() => setHashtagOpen(false)}
                selectedHashtag={selectedHashtag}
                onConfirm={updateHashtag}
            />
            <ScriptEdit
                open={scriptOpen}
                handleClose={() => setScriptOpen(false)}
                script={currentScript}
                onConfirm={updateScript}
            />
            <SortEdit 
                open={sortOpen}
                handleClose={() => setSortOpen(false)}
                selectedSortList={currentSort}
                onConfirm={updateSort}
            />

            {/* circle button at the corner */}
            <div 
                style={{
                    position: 'absolute',
                    top: '5%',
                    right: '20px',
                }}
            >
                <CircleIconButton
                    onClickHandler={clearAllFilter}
                >
                    <ClearRoundedIcon />
                </CircleIconButton>
            </div>
        </div>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
    filterlist: state.filter.list,
})) (FilterList)
