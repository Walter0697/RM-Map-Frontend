import React, { useState } from 'react'
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

import styles from '../styles/list.module.css'

function MarkerPage({ markers }) {
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
                        toMapView={() => setShowingList(false)}
                        markers={markers || []}
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
    markers: state.marker.markers
})) (MarkerPage)