import React, { useState, useEffect, useRef, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'

import AddIcon from '@mui/icons-material/Add'
import CancelIcon from '@mui/icons-material/Cancel'
import { Alert, Button } from '@mui/material'

import useBoop from '../hooks/useBoop'

import Base from './Base'
import CountryMap from '../components/country/CountryMap'
import StationMap from '../components/station/StationMap'
import StationInfo from '../components/station/StationInfo'
import CircleIconButton from '../components/field/CircleIconButton'
import TopBar from '../components/topbar/TopBar'
import AutoHideAlert from '../components/AutoHideAlert'

import CountryPointCreateForm from '../components/form/country/CountryPointCreateForm'

import actions from '../store/actions'
import graphql from '../graphql'

const currentDimension = {
    width: 2291,
    height: 2048,
}
const headerHeight = 56

function CountryPage({
    stations,
    dispatch,
}) {
    const history = useHistory()

    const [ isAdding, setIsAdding ] = useState(false)
    const [ addingPosition, setAddingPosition ] = useState(null)
    const [ addDialog, setAddDialog ] = useState(false)

    const mapPointerRef = useRef(null)
    const mapPointer2Ref = useRef(null)

    const containerRef = useRef(null)
    useEffect(() => {
        if (containerRef) {
            setViewPort({
                x: containerRef.current.clientWidth,
                y: containerRef.current.clientHeight,
            })
        }
    }, [containerRef])

    const [ viewPort, setViewPort ] = useState({ x: 0, y: 0 })
    const [ trigger, setTrigger ] = useState(0)

    const [ currentPointer1, setPointer1 ] = useState({ x: 0, y: 0 })
    const [ currentPointer2, setPointer2 ] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (mapPointerRef && mapPointerRef.current) {
            const topPos = mapPointerRef.current.getBoundingClientRect().top + window.scrollY
            const leftPos = mapPointerRef.current.getBoundingClientRect().left + window.scrollX
            setPointer1({
                // set to current location relative to screen
                x: leftPos,
                y: topPos - headerHeight,
            })
        }
    }, [mapPointerRef, trigger])

    const visibleBoundary = useMemo(() => {
        const expectedWidth = window.innerWidth * 0.9
        const expectedHeight =  expectedWidth * (currentDimension.height / currentDimension.width)
        const left = (window.innerWidth - expectedWidth) / 2
        const right = left + expectedWidth
        const top = (window.innerHeight - expectedHeight) / 2 - headerHeight
        const bottom = top + expectedHeight
        return {
            left,
            right,
            top,
            bottom,
        }
    }, [viewPort])

    const shouldShowPointer = useMemo(() => {
        if (currentPointer1.x > visibleBoundary.left && currentPointer1.x < visibleBoundary.right) {
            if (currentPointer1.y > visibleBoundary.top && currentPointer1.y < visibleBoundary.bottom) {
                return true
            }
        }
        return false
    }, [visibleBoundary, currentPointer1])

    const viewBoxStr = useMemo(() => {
        return `0 0 ${viewPort.x} ${viewPort.y}`
    }, [viewPort])

    const onAddClickHandler = () => {
        setIsAdding(true)
        setAddingPosition(null)
    }

    const onAddCancelHandler = () => {
        setIsAdding(false)
        setAddingPosition(null)
    }

    const onAddButtonClickHandler = () => {
        if (isAdding) {
            onAddCancelHandler()
        } else {
            onAddClickHandler()
        }
    }

    const onAddPointerClick = () => {
        setAddDialog(true)
    }

    const onCountryPointCreated = () => {
        setAddDialog(false)
    }

    const onMapClickHandler = (location) => {
        if (isAdding) {
            setAddingPosition(location)
        }
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/markers')}
                label='Country Page'
            />
            <div 
                ref={containerRef}
                style={{
                    height: '80%',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <CountryMap 
                    dimension={currentDimension}
                    pointerRef={mapPointerRef}
                    pointerRef2={mapPointer2Ref}
                    setTrigger={setTrigger}
                    onItemClickHandler={() => {}}
                    onMapClickHandler={onMapClickHandler}
                    addingPosition={addingPosition}
                />
                <svg 
                    viewBox={viewBoxStr}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                    }}
                >
                    {shouldShowPointer && (
                        <line x1={20 + 80} y1={1} x2={currentPointer1.x} y2={currentPointer1.y} stroke='red'/>
                    )}
                </svg>

                {/* button list */}
                <div
                    style={{ 
                        position: 'absolute',
                        top: '5%',
                        right: '30px',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={() => onAddButtonClickHandler()}
                    >
                        {isAdding ? <CancelIcon color={'error'} /> : <AddIcon />}
                    </CircleIconButton>
                </div>

                {/* adding related */}
                {isAdding && (
                    <div style={{
                        position: 'absolute',
                        top: '5%',
                        left: '30px',
                    }}>
                        <Alert severity="info">Click on the map to add point!</Alert>
                    </div>
                )}
                
                {addingPosition && (
                    <div style={{
                            position: 'absolute',
                            top: '15%',
                            left: '5%',
                            width: '90%',
                        }}
                    >
                        <Button
                            style={{
                                width: '100%',
                            }}
                            variant="contained"
                            onClick={() => onAddPointerClick()}
                        >Add Pointer</Button>
                    </div>
                )}
                
            </div>
            <CountryPointCreateForm 
                open={addDialog}
                handleClose={() => setAddDialog(false)}
                position={addingPosition}
                mapName={'JAPAN'}
                onCreated={onCountryPointCreated}
            />
        </Base>
    )
}

export default connect(state => ({
    stations: state.station.stations,
})) (CountryPage)