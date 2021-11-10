import React, { useState, useEffect } from 'react'
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

    const [ showingList, setShowingList ] = useState(false)
    const { transform } = useSpring({
        config: config.gentle,
        from: { transform: 'rotateY(0deg)' },
        transform: showingList ? 'rotateY(180deg)' : 'rotateY(0deg)',
    })

    const [ filterOption, setFilterOption ] = useState({})
    const [ filterValue, setFilterValue ] = useState('')
    const [ finalFilterValue, setFinalFilterValue ] = useState('')
    const [ isFilterExpanded, setExpandFilter ] = useState(false)

    useEffect(() => {
        let options = []
        let typefilter = []
        eventtypes.forEach(et => {
            typefilter.push({
                label: et.label,
                value: et.value,
                icon: process.env.REACT_APP_IMAGE_LINK + et.icon_path,
                size: 'small'
            })
        })
        options.push({
            title: 'Range',
            label: 'range',
            options: [{
                label: '< 100m',
                value: '100m',
                icon: false,
                size: 'small'
            }, {
                label: '< 250m',
                value: '250m',
                icon: false,
                size: 'small'
            }, {
                label: '< 500m',
                value: '500m',
                icon: false,
                size: 'small'
            }, {
                label: '< 1000m',
                value: '1000m',
                icon: false,
                size: 'small'
            }],
            type: filters.types.single,
        })

        options.push({
            title: 'Event Types',
            label: 'eventtype',
            options: typefilter,
            type: filters.types.multiple,
        })

        options.push({
            title: 'Attribute',
            label: 'attribute',
            options: [{
                label: 'favourite',
                value: 'favourite',
                icon: false,
                size: 'small',
            }, {
                label: 'hurry',
                value: 'hurry',
                icon: false,
                size: 'small',
            }],
            type: filters.types.multiple,
        })

        setFilterOption(options)
    }, [eventtypes])

    const confirmFilterValue = () => {
        setFinalFilterValue(filterValue)
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
                        markers={markers || []}
                        setSelectedById={setSelectedById}
                        filterOption={filterOption} // for filter option
                        filterValue={filterValue}   // for filter temporary value setter and getter
                        setFilterValue={setFilterValue}  
                        isFilterExpanded={isFilterExpanded} // for viewing filter
                        setExpandFilter={setExpandFilter}
                        confirmFilterValue={confirmFilterValue} // for confirming filter values
                        finalFilterValue={finalFilterValue} // for filter options
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
                        markers={markers || []}
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