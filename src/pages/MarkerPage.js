import React, { useState } from 'react'
import {
    IconButton,
} from '@mui/material'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import Base from './Base'

import ExploreIcon from '@mui/icons-material/Explore'

import MarkerMap from '../components/map/MarkerMap'
import MarkerList from '../components/list/MarkerList'

import styles from '../styles/list.module.css'

const items = [
    {
        label: '123123',
    },
    {
        label: '234234',
    },
    {
        label: '565656',
    },
    {
        label: '123123',
    },
    {
        label: '234234',
    },
    {
        label: '565656',
    },
    {
        label: '123123',
    },
    {
        label: '234234',
    },
    {
        label: '565656',
    },
]

function MarkerPage() {
    const [ showingList, setShowingList ] = useState(false)
    const { transform } = useSpring({
        config: config.gentle,
        from: { transform: 'rotateY(0deg)' },
        transform: showingList ? 'rotateY(180deg)' : 'rotateY(0deg)',
    })

    return (
        <Base>
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
                        markers={items}
                    />
                </div>
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
        </Base>
    )
}

export default MarkerPage