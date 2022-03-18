import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import {
    Grid,
} from '@mui/material'
import { useMutation } from '@apollo/client'

import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import WrongLocationIcon from '@mui/icons-material/WrongLocation'

import actions from '../../store/actions'
import graphql from '../../graphql'

function StationInfo({
    currentMap,
    identifier,
    station,
    onStationUpdate,
    onStationError,
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
            backgroundColor: '#48acdb',
            height: '100%',
            width: '90%',
            boxShadow: '2px 2px 6px',
            textTransform: 'none',
            padding: '10px',
            color: 'white',
            borderRadius: '5px',
            }}
        >
            <Grid container fullWidth
                style={{
                    height: '100%',
                }}
            >
                {station ? (
                    <>
                        <Grid item xs={7} md={7} lg={7}>
                            <Grid container>
                                <Grid item xs={12} style={{
                                    fontSize: '18px',
                                    fontWeight: '500',
                                }}>
                                    {station.name}
                                </Grid>
                                <Grid item xs={12} style={{
                                    fontSize: '12px',
                                }}>
                                    {station.label}
                                </Grid>
                                <Grid item xs={12} style={{
                                    paddingLeft: '5px',
                                    paddingTop: '12px',
                                }}>
                                    {station.line.map((l, index) => (
                                        <div 
                                            style={{
                                                marginBottom: '5px',
                                            }}
                                            key={`info${index}`}>
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
                                            }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                }}>{l.localName}</div>
                                                <div style={{
                                                    fontSize: '8px',
                                                }}>{l.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={5} md={5} lg={5}>
                            <div 
                                style={{
                                    position: 'relative',
                                    height: '100%',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                {station.active ? (
                                    <Grid container fullWidth>
                                        <Grid 
                                            item xs={12} 
                                            style={{
                                                color: 'green',
                                                fontWeight: '700',
                                                fontSize: '20px',
                                                paddingTop: '10px',
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                paddingBottom: '10px',
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
                                                fontSize: '60px',
                                            }}/>
                                            
                                        </Grid>
                                        <Grid item xs={12}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                color: 'red',
                                            }}
                                        >
                                            Cancel record?
                                        </Grid>
                                        
                                    </Grid>
                                ) : (
                                    <Grid container fullWidth>
                                        <Grid 
                                            item xs={12} 
                                            style={{
                                                color: 'red',
                                                fontWeight: '700',
                                                fontSize: '15px',
                                                paddingTop: '10px',
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                paddingBottom: '10px',
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
                                                fontSize: '60px',
                                            }}/>
                                        </Grid>
                                        <Grid item xs={12}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                color: 'green',
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