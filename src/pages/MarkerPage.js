import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
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
import AutoHideAlert from '../components/AutoHideAlert'

import filters from '../scripts/filter'
import constants from '../constant'

import styles from '../styles/list.module.css'

function MarkerPage({ 
    markers,
    eventtypes,
}) {
    // selected marker
    const [ selectedMarker, setSelected ] = useState(null)
    // if the selected marker is set to be schedule
    const [ scheduleFormOpen, setScheduleFormOpen ] = useState(false)
    const [ createAlert, confirmCreated ] = useBoop(3000)

    // if it is showing list or map
    const [ showingList, setShowingList ] = useState(false)
    const { transform } = useSpring({
        config: config.gentle,
        from: { transform: 'rotateY(0deg)' },
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

    const displayMarker = useMemo(() => {
        const filteredMarkers = markers.filter(s => s.status !== constants.status.arrived && s.status !== constants.status.scheduled)

        if (finalFilterValue === '') return filteredMarkers
        const list = filters.map.mapMarkerWithFilter(filteredMarkers, finalFilterValue, filterOption)
        return list
    }, [markers, finalFilterValue, filterOption, showingList, selectedMarker])

    const [ showFilterInListView, showFilter ] = useState(false)

    useEffect(() => {
        let options = []
        
        //options.push(filters.generate.rangeFilter())
        options.push(filters.generate.eventTypeFilter(eventtypes))
        options.push(filters.generate.attributeFilter())
        options.push(filters.generate.estimateTimeFilter())
        options.push(filters.generate.pricingFilter())
        options.push(filters.generate.labelFilter())

        setFilterOption(options)
    }, [eventtypes])

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
                        markers={displayMarker || []}
                        setSelectedById={setSelectedById}
                        filterOption={filterOption} // for filter option
                        filterValue={filterValue}   // for filter temporary value setter and getter
                        setFilterValue={setFilterValue}  
                        isFilterExpanded={isFilterExpanded} // for viewing filter
                        setExpandFilter={setExpandFilter}
                        confirmFilterValue={confirmFilterValue} // for confirming filter values
                        finalFilterValue={finalFilterDisplay} // for filter options
                        scheduleCreated={confirmCreated}
                    />
                </div>
                <div
                    className={styles.flip}
                    style={{
                        transform: 'rotateY(180deg)',
                        background: '#89fca8',
                    }}
                >
                    <MarkerList
                        height={'100%'}
                        showingList={showingList}
                        markers={displayMarker || []}
                        setSelectedById={setSelectedById}
                        filterOption={filterOption} // for filter option
                        filterValue={filterValue}   // for filter temporary value setter and getter
                        setFilterValue={setFilterValue}  
                        isFilterExpanded={isFilterExpanded} // for viewing filter
                        setExpandFilter={setExpandFilter}
                        confirmFilterValue={confirmFilterValue} // for confirming filter values
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
                                bottom: '15%',
                                right: '20px',
                            }}
                        >
                            <CircleIconButton
                                onClickHandler={() => showFilter(s => !s)}
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
                marker={selectedMarker}
            />
            <ScheduleForm
                open={scheduleFormOpen}
                handleClose={() => setScheduleFormOpen(false)}
                onCreated={onScheduleCreated}
                marker={selectedMarker}
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully create marker!'}
                timing={3000}
            />
        </Base>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
})) (MarkerPage)