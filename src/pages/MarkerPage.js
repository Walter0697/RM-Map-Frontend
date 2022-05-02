import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Base from './Base'

import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import ExploreIcon from '@mui/icons-material/Explore'
import FilterAltIcon from '@mui/icons-material/FilterAlt'

import useBoop from '../hooks/useBoop'

import MarkerMap from '../components/map/MarkerMap'
import MarkerList from '../components/list/MarkerList'
import MarkerView from '../components/marker/MarkerView'
import CircleIconButton from '../components/field/CircleIconButton'
import ScheduleForm from '../components/form/ScheduleForm'
import MarkerEditForm from '../components/form/MarkerEditForm'
import AutoHideAlert from '../components/AutoHideAlert'

import filters from '../scripts/filter'
import search from '../scripts/search'

import styles from '../styles/list.module.css'

function MarkerPage({ 
    markers,
    eventtypes,
    filterlist,
}) {
    const history = useHistory()
    const location = useLocation()
    const suffix = location.pathname.replace('/markers', '')

    // selected marker
    const [ selectedMarker, setSelected ] = useState(null)
    // if the selected marker is set to be schedule
    const [ scheduleFormOpen, setScheduleFormOpen ] = useState(false)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    // if the selected marker is set to be editing
    const [ editingMarker, setEditing ] = useState(false)
    const [ editAlert, confirmEdited ] = useBoop(3000)

    // if it is showing list or map
    const [ showingList, setShowingList ] = useState((suffix && suffix === '/list') ? true : false)
    const { transform } = useSpring({
        config: config.gentle,
        from: { transform: (suffix && suffix === '/list') ? 'rotateY(180deg)' : 'rotateY(0deg)' },
        transform: showingList ? 'rotateY(180deg)' : 'rotateY(0deg)',
    })

    // filter option
    const [ filterOption, setFilterOption ] = useState({})
    const [ filterValue, setFilterValue ] = useState('')
    const [ finalFilterValue, setFinalFilterValue ] = useState('')
    const [ isFilterExpanded, setExpandFilter ] = useState(false)
    const finalFilterDisplay = useMemo(() => {
        if (finalFilterValue === '') return null
        let list = filters.parser.parseStringToDisplayArr(filterOption, finalFilterValue)
        return list
    }, [finalFilterValue])
    const [ customFilterValue, setCustomFilterValue ] = useState('')

    // const displayMarker = useMemo(() => {
    //     //const filteredMarkers = markers.filter(s => s.status === '' || s.status === 'scheduled')
    //     const filteredMarkers = markerhelper.find.active(markers)

    //     //if (finalFilterValue === '' && customFilterValue === '') return filteredMarkers

    //     const filteredByQuery = filters.map.filterByQuery(filteredMarkers, customFilterValue, eventtypes)
    //     const list = filters.map.mapMarkerWithFilter(filteredByQuery, finalFilterValue, filterOption)

    //     return list
    // }, [markers, finalFilterValue, filterOption, customFilterValue, showingList, eventtypes, editAlert])

    const filteredMarkers = useMemo(() => {
        return search.filter.parse(markers, filterlist, eventtypes)
    }, [markers, filterlist, eventtypes, editAlert])

    const [ showFilterInListView, showFilter ] = useState(false)

    // useEffect(() => {
    //     let options = []
        
    //     //options.push(filters.generate.rangeFilter())
    //     options.push(filters.generate.eventTypeFilter(eventtypes))
    //     options.push(filters.generate.attributeFilter())
    //     options.push(filters.generate.estimateTimeFilter())
    //     options.push(filters.generate.pricingFilter())
    //     options.push(filters.generate.needBookingFilter())

    //     setFilterOption(options)
    // }, [eventtypes])

    const setSelectedById = (id) => {
        let selected = null
        markers.forEach(m => {
            if (m.id === id) {
                selected = m
                return
            }
        })
        if (selected) {
            setSelected(selected)
        }
    } 

    const confirmFilterValue = (finalValue) => {
        setFinalFilterValue(finalValue)
        setExpandFilter(false)
    }

    const onMarkerUpdated = () => {
        setSelected(null)
        setEditing(false)
        confirmEdited()
    }

    const onScheduleCreated = () => {
        setSelected(null)
        setScheduleFormOpen(false)
        confirmCreated()
    }

    return (
        <Base>
            {/* flipping card logic */}
            <animated.div 
                style={{
                    width: '100%',
                    height: '90%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transform: transform,
                }}
            >
                <div
                    className={styles.flip}
                >
                    <MarkerMap 
                        showingList={showingList}
                        toListView={() => setShowingList(true)}
                        markers={filteredMarkers || []}
                        setSelectedById={setSelectedById}
                        filterOption={filterOption} // for filter option
                        filterValue={filterValue}   // for filter temporary value setter and getter
                        setFilterValue={setFilterValue}  
                        isFilterExpanded={isFilterExpanded} // for viewing filter
                        setExpandFilter={setExpandFilter}
                        confirmFilterValue={confirmFilterValue} // for confirming filter values
                        customFilterValue={customFilterValue}
                        setCustomFilterValue={setCustomFilterValue}
                        finalFilterValue={finalFilterDisplay} // for filter options
                        scheduleCreated={confirmCreated}
                    />
                </div>
                <div
                    className={styles.flip}
                    style={{
                        transform: 'rotateY(180deg)',
                        background: '#b2d2a4',
                    }}
                >
                    <MarkerList
                        height={'100%'}
                        showingList={showingList}
                        markers={filteredMarkers || []}
                        setSelectedById={setSelectedById}
                        filterOption={filterOption} // for filter option
                        filterValue={filterValue}   // for filter temporary value setter and getter
                        setFilterValue={setFilterValue}  
                        isFilterExpanded={isFilterExpanded} // for viewing filter
                        setExpandFilter={setExpandFilter}
                        confirmFilterValue={confirmFilterValue} // for confirming filter values
                        customFilterValue={customFilterValue}
                        setCustomFilterValue={setCustomFilterValue}
                        finalFilterValue={finalFilterDisplay} // for filter options
                        filterOpen={showFilterInListView}
                    />
                </div>

                {/* place button outside since button cannot be clicked with the rotate transform */}
                { showingList && (
                    <>
                        <div 
                            style={{
                                position: 'absolute',
                                transform: 'rotateY(180deg)',
                                bottom: '5%',
                                right: '20px',
                            }}
                        >
                            <CircleIconButton
                                onClickHandler={() => setShowingList(false)}
                            >
                                <ExploreIcon />
                            </CircleIconButton>
                        </div>
                        <div 
                            style={{
                                position: 'absolute',
                                transform: 'rotateY(180deg)',
                                top: '5%',
                                right: '20px',
                            }}
                        >
                            <CircleIconButton
                                // onClickHandler={() => showFilter(s => !s)}
                                onClickHandler={() => history.replace('/filter/list')}
                            >
                                <FilterAltIcon />
                            </CircleIconButton>
                        </div>
                    </>
                )}
            </animated.div>
            <MarkerView
                open={!!selectedMarker}
                handleClose={() => setSelected(null)}
                openSchedule={() => setScheduleFormOpen(true)}
                editMarker={() => setEditing(true)}
                marker={selectedMarker}
            />
            <ScheduleForm
                open={scheduleFormOpen}
                handleClose={() => setScheduleFormOpen(false)}
                onCreated={onScheduleCreated}
                marker={selectedMarker}
            />
            <MarkerEditForm
                open={editingMarker}
                handleClose={() => setEditing(false)}
                onUpdated={onMarkerUpdated}
                marker={selectedMarker}
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully create schedule!'}
                timing={3000}
            />
            <AutoHideAlert 
                open={editAlert}
                type={'success'}
                message={'Successfully edit marker!'}
                timing={3000}
            />
        </Base>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
    filterlist: state.filter.list,
})) (MarkerPage)