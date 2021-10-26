import React, { useState, useEffect } from 'react'
import Base from './Base'

import { useQuery } from '@apollo/client'

import {
    IconButton,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import ExploreIcon from '@mui/icons-material/Explore'

import MarkerMap from '../components/map/MarkerMap'
import MarkerList from '../components/list/MarkerList'
import MarkerView from '../components/marker/MarkerView'

import graphql from '../graphql'

import styles from '../styles/list.module.css'

function MarkerPage() {
    // marker list
    const [ markers, setMarkers ] = useState([])
    const [ selectedMarker, setSelected ] = useState(null)

    // graphql request 
    const { data: markerData, loading: markerLoading, error: markerError } = useQuery(graphql.markers.list)

    useEffect(() => {
        if (markerData) {
            setMarkers(markerData.markers)
        }

        if (markerError) {
            console.log(markerError)
        }
    }, [markerData, markerError])

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
                        toListView={() => setShowingList(true)}
                        markers={markers}
                        setSelectedById={setSelectedById}
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
                        toMapView={() => setShowingList(false)}
                        markers={markers}
                        setSelectedById={setSelectedById}
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
                        <IconButton
                            size='large'
                            style={{
                                backgroundColor: 'white',
                                boxShadow: '2px 2px 6px',
                            }}
                            onClick={() => setShowingList(false)}
                        >
                            <ExploreIcon />
                        </IconButton>
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

export default MarkerPage