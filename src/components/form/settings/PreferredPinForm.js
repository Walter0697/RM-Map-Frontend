import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client' 
import {
    Grid,
} from '@mui/material'

import BaseForm from '../BaseForm'

import graphql from '../../../graphql'
import constants from '../../../constant'

function PreferredPinForm({
    open,
    pinInfo,
    handleClose,
    onCreated,
}) {
    // graphql request
    const { data: pinData, loading: pinLoading, error: pinError } = useQuery(graphql.pins.select, { fetchPolicy: 'no-cache' })
    const [ updatePreferredPinGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.users.update_pin, { errorPolicy: 'all' })
    
    const [ pinList, setPinList ] = useState([])
    const [ selectedPinId, setPinId ] = useState(-1)

    const confirmLoading = useMemo(() => {
        if (selectedPinId === -1) return true
        if (pinLoading) return true
        if (updateLoading) return true
        return false
    }, [ selectedPinId, pinLoading, updateLoading ])

    useEffect(() => {
        setPinId(pinInfo?.pin_id ?? -1)
    }, [pinInfo, open])

    useEffect(() => {
        if (pinData) {
            setPinList(pinData.pins)
        }

        if (pinError) {
            console.log(pinError)
        }
    }, [pinData, pinError])

    useEffect(() => {
        if (updateData) {
            onCreated && onCreated(updateData)
        }

        if (updateError) {
            console.log(updateError)
        }
    }, [updateData, updateError])

    const onSubmitHandler = () => {
        if (selectedPinId === -1) return 
        updatePreferredPinGQL({ variables: { 
            label: pinInfo.label,
            pin_id: selectedPinId,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={pinInfo ? `Editing ${pinInfo.name}` : 'Editing'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Confirm'}
                loading={confirmLoading}
            >
                <Grid container spacing={2}>
                    {
                        pinList.map(( item, index ) => (
                            <Grid 
                                item xs={6} md={6} lg={6}
                                key={index}
                                style={{
                                    marginBottom: '15px',
                                    borderRadius: '5px',
                                    paddingLeft: '5px',
                                    paddingRight: '5px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#dbfdff',
                                        padding: '5px',
                                        border: (selectedPinId === item.id) ? '3px solid red' : '3px solid black',
                                    }}
                                    onClick={() => setPinId(item.id)}
                                >
                                    {item.label}  
                                    <img
                                        width='100%'
                                        src={constants.BackendImageLink + item.display_path}
                                    />  
                                </div>
                            </Grid>
                        ))
                    }
                </Grid>
            </BaseForm>
        </>
    )
}

export default PreferredPinForm