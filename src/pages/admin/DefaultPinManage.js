import React, { useState, useEffect } from 'react'
import {
    Grid,
    Button,
    IconButton,
} from '@mui/material'

import { useQuery, useLazyQuery } from '@apollo/client'

import useBoop from '../../hooks/useBoop'

import EditIcon from '@mui/icons-material/Edit'

import AdminTopBar from '../../components/topbar/AdminTopBar'
import DefaultPinForm from '../../components/form/admin/DefaultPinForm'

import graphql from '../../graphql'
import constants from '../../constant'

function DefaultPinManage() {
    // graphql request
    const { data: pinData, loading: pinLoading, error: pinError } = useQuery(graphql.pins.select, { fetchPolicy: 'no-cache' })
    const [ listDefaultPinsGQL, { data: defaultData, loading: defaultLoading, error: defaultError } ] = useLazyQuery(graphql.defaults.pins, { fetchPolicy: 'no-cache' })

    // pin information for selection
    const [ pinList, setPinList ] = useState([])

    const [ defaultList, setList ] = useState([])

    const [ editFormOpen, setFormOpen ] = useState(false)
    const [ selectedDefault, setSelected ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createMessage, setMessage ] = useState('')
    
    useEffect(() => {
        listDefaultPinsGQL()
    }, [])

    useEffect(() => {
        if (defaultData) {
            setList(defaultData.defaultpins)
        }

        if (defaultError) {
            console.log(defaultError)
        }
    }, [defaultData, defaultError])

    useEffect(() => {
        if (pinData) {
            setPinList(pinData.pins)
        }

        if (pinError) {
            console.log(pinError)
        }
    }, [pinData, pinError])

    const onUpdateFormOpen = (item) => {
        setSelected(item)
        setFormOpen(true)
    }

    const onDefaultUpdated = () => {
        setMessage('successfully updated default pin')
        setFormOpen(false)
        confirmCreated()
        listDefaultPinsGQL()
    }

    return (
        <>
            <AdminTopBar
                label={'Default Pin Manage'}
                alertOpen={createAlert}
                alertMessage={createMessage}
            />
            <Grid
                container
                spacing={2}
                style={{
                    marginTop: '10px',
                    marginLeft: '1%',
                    width: '98%',
                }}
            >
                { defaultList.map(( item, index) => (
                    <Grid
                        item xs={12} md={12} lg={12}
                        style={{
                            backgroundColor: '#dbfdff',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            marginRight: '10px',
                            borderRadius: '5px',
                            height: '100px',
                        }}
                        key={index}
                    >
                        <Grid container fullWidth>
                            { item.pin?.display_path ? (
                                <Grid 
                                    item xs={4} md={4} lg={4}
                                >
                                    <img
                                    height='70px'
                                    src={constants.BackendImageLink + item.pin.display_path}
                                />
                                </Grid>
                            ) : (
                                <Grid item xs={4} md={4} lg={4}></Grid>
                            )}
                            <Grid  item xs={6} md={6} lg={6}>
                                <Grid container fullWidth>
                                    <Grid item xs={12}
                                        style={{
                                            fontweight: '600',
                                            fontSize: '20px',
                                            marginBottom: '5px',
                                        }}
                                    >
                                        {item.label}
                                    </Grid>
                                    <Grid item xs={12}
                                        style={{
                                            fontSize: '15px',
                                            color: 'grey',
                                        }}
                                    >
                                        {item.pin?.label ? item.pin.label : '<USING DEFAULT>'}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} md={2} lg={2}>
                                <IconButton
                                    onClick={() => onUpdateFormOpen(item)}
                                >
                                    <EditIcon /> 
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
            <DefaultPinForm
                open={editFormOpen}
                handleClose={() => setFormOpen(false)}
                onUpdated={onDefaultUpdated}
                pinList={pinList}
                defaultPin={selectedDefault}
            />
        </>
    )
}

export default DefaultPinManage