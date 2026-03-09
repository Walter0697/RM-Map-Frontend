import React, { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client' 
import Grid from '@mui/material/GridLegacy'
import backend from '../../../constant/backend'

import BaseForm from '../BaseForm'

import graphql from '../../../graphql'

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

    }, [pinData, pinError])

    useEffect(() => {
        if (updateData) {
            onCreated && onCreated(updateData)
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
                                item xs={4} md={4} lg={4}
                                key={index}
                                style={{
                                    marginBottom: '8px',
                                    borderRadius: '5px',
                                    paddingLeft: '4px',
                                    paddingRight: '4px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#dbfdff',
                                        padding: '6px',
                                        border: (selectedPinId === item.id) ? '2px solid red' : '2px solid black',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setPinId(item.id)}
                                >
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                    <img
                                        width='100%'
                                        src={backend.IMAGE_LINK + item.display_path}
                                        alt={item.label}
                                        style={{
                                            height: '72px',
                                            objectFit: 'contain',
                                        }}
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
