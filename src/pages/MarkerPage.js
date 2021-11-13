import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import Base from './Base'

import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import ExploreIcon from '@mui/icons-material/Explore'

import MarkerMap from '../components/map/MarkerMap'
import MarkerList from '../components/list/MarkerList'
import MarkerView from '../components/marker/MarkerView'
import CircleIconButton from '../components/field/CircleIconButton'

import filters from '../scripts/filter'

import styles from '../styles/list.module.css'

function MarkerPage({ 
    markers,
    eventtypes,
}) {
    // selected marker
    const [ selectedMarker, setSelected ] = useState(null)

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
        if (finalFilterValue === '') return markers
        const list = filters.map.mapMarkerWithFilter(markers, finalFilterValue, filterOption)
        return list
    }, [markers, finalFilterValue, filterOption, showingList, selectedMarker])

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
                        filterOption={filterOption}
                        filterValue={filterValue}
                        setFilterValue={setFilterValue}
                        isFilterExpanded={isFilterExpanded}
                        setExpandFilter={setExpandFilter}
                    />
                </div>

                {/* place button outside since button cannot be clicked with the rotate transform */}
                { showingList && (
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
                )}
            </animated.div>
            <MarkerView
                open={!!selectedMarker}
                handleClose={() => setSelected(null)}
                marker={selectedMarker}
            />
        </Base>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
})) (MarkerPage)