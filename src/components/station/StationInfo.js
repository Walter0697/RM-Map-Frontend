import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import Grid from '@mui/material/GridLegacy'
import { useMutation } from '@apollo/client'

import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import WrongLocationIcon from '@mui/icons-material/WrongLocation'

import constants from '../../constant'
import actions from '../../store/actions'
import graphql from '../../graphql'

function StationInfo({
    currentMap,
    identifier,
    station,
    onStationUpdate,
    onStationError,
    onLineClick,
    dispatch,
}) {
    const [ updateStationGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.stations.update_active, { errorPolicy: 'all' }) 

    useEffect(() => {
        if (updateError) {
            onStationError(updateError.message)
        }

        if (updateData) {
            const mapName = updateData.updateStation.map_name
            const updatedIdentifier = updateData.updateStation.identifier
            const updatedActive = updateData.updateStation.active
            onStationUpdate(updatedActive)

            dispatch(actions.updateStation(
                updatedIdentifier, mapName, updatedActive
            ))
        }
    }, [updateData, updateError])

    const setStationState = (active) => {
        updateStationGQL({ variables: {
            identifier: identifier,
            map_name: currentMap,
            active: active,
        }})
    }

    const activeStation = () => {
        setStationState(true)
    }

    const inactiveStation = () => {
        if (!confirm(`are you sure to remove ${station.name}'s record?`)) return
        setStationState(false)
    }

    return (
        <div 
            style={{
                backgroundColor: constants.colors.CardBackground,
                height: '100%',
                width: '90%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
                padding: '12px',
                color: 'white',
                borderRadius: '10px',
                overflow: 'hidden',
            }}
        >
            <Grid container fullWidth
                style={{
                    height: '100%',
                    alignContent: 'flex-start',
                }}
            >
                {station ? (
                    <>
                        <Grid item xs={12} md={5} lg={5}>
                            <Grid container>
                                <Grid item xs={12} style={{
                                    fontSize: '20px',
                                    fontWeight: '500',
                                    overflowWrap: 'anywhere',
                                }}>
                                    {station.name}
                                </Grid>
                                <Grid item xs={12} style={{
                                    fontSize: '15px',
                                    color: '#d7e3ff',
                                    overflowWrap: 'anywhere',
                                }}>
                                    {station.label}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={7} md={4} lg={4}
                            style={{
                                maxHeight: '100%',
                                overflowY: 'auto',
                                paddingRight: '8px',
                            }}
                        >
                            {station.line.map((l, index) => (
                                <div 
                                    style={{
                                        marginBottom: '5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: onLineClick ? 'pointer' : 'default',
                                    }}
                                    key={`info${index}`}
                                    onClick={() => onLineClick && onLineClick(l)}
                                >
                                    <div
                                        style={{
                                            display: 'inline-block',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: '2px solid white',
                                            backgroundColor: l.colour
                                        }}
                                    />
                                    <div style={{
                                        display: 'inline-block',
                                        paddingLeft: '5px',
                                        minWidth: 0,
                                    }}>
                                        <div style={{
                                            fontSize: '12px',
                                            overflowWrap: 'anywhere',
                                        }}>{l.localName}</div>
                                        <div style={{
                                            fontSize: '8px',
                                            color: '#d7e3ff',
                                            overflowWrap: 'anywhere',
                                        }}>{l.name}</div>
                                    </div>
                                </div>
                            ))}
                        </Grid>
                        <Grid item xs={5} md={3} lg={3}>
                            <div 
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                {station.active ? (
                                    <Grid container fullWidth style={{ alignContent: 'center' }}>
                                        <Grid 
                                            item xs={12} 
                                            style={{
                                                color: 'green',
                                                fontWeight: '700',
                                                fontSize: '18px',
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                paddingBottom: '6px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Arrived
                                        </Grid>
                                        <Grid item xs={12}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                            onClick={inactiveStation}
                                        >
                                            <WrongLocationIcon sx={{
                                                color: 'red',
                                                fontSize: '48px',
                                            }}/>
                                            
                                        </Grid>
                                        <Grid item xs={12}
                                            style={{
                                                fontSize: '11px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                color: 'red',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Cancel record?
                                        </Grid>
                                        
                                    </Grid>
                                ) : (
                                    <Grid container fullWidth style={{ alignContent: 'center' }}>
                                        <Grid 
                                            item xs={12} 
                                            style={{
                                                color: 'red',
                                                fontWeight: '700',
                                                fontSize: '15px',
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                paddingBottom: '6px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Will be there
                                        </Grid>
                                        <Grid item xs={12}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                            onClick={activeStation}
                                        >
                                            <AddLocationAltIcon sx={{
                                                color: 'green',
                                                fontSize: '48px',
                                            }}/>
                                        </Grid>
                                        <Grid item xs={12}
                                            style={{
                                                fontSize: '11px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                color: 'green',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Add record!
                                        </Grid>
                                    </Grid>
                                )}
                            </div>
                        </Grid>
                    </>
                ) : (
                    <Grid item xs={12} md={12} lg={12}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            fontSize: '20px',
                        }}
                    >
                        Please select a station
                    </Grid>
                )}
            </Grid>
        </div>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
})) (StationInfo)
