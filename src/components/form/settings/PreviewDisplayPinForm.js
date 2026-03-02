import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Alert, Grid } from '@mui/material'

import backend from '../../../constant/backend'
import BaseForm from '../BaseForm'
import graphql from '../../../graphql'

function PreviewDisplayPinForm({
    open,
    handleClose,
    jwt,
    currentPinId,
    onUpdated,
}) {
    const { data: pinData, loading: pinLoading, error: pinError } = useQuery(graphql.pins.select, { fetchPolicy: 'no-cache' })

    const [ pinList, setPinList ] = useState([])
    const [ selectedPinId, setSelectedPinId ] = useState(-1)
    const [ updateLoading, setUpdateLoading ] = useState(false)
    const [ updateError, setUpdateError ] = useState('')

    useEffect(() => {
        if (pinData?.pins) {
            setPinList(pinData.pins)
        }
        if (pinError) {
            setUpdateError(pinError.message || 'Failed to load pin options')
        }
    }, [pinData, pinError])

    useEffect(() => {
        setSelectedPinId(currentPinId || -1)
        setUpdateError('')
    }, [currentPinId, open])

    const confirmLoading = useMemo(() => {
        if (pinLoading) return true
        if (updateLoading) return true
        if (selectedPinId <= 0) return true
        return false
    }, [pinLoading, updateLoading, selectedPinId])

    const onSubmitHandler = async () => {
        if (!jwt || selectedPinId <= 0) return

        setUpdateLoading(true)
        setUpdateError('')

        try {
            const response = await fetch(backend.withBasePath('settings/preview-pin'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify({ pin_id: selectedPinId }),
            })

            if (!response.ok) {
                const raw = await response.text()
                try {
                    const parsed = JSON.parse(raw)
                    setUpdateError(parsed.message || parsed.error || raw || 'Failed to update preview display pin')
                } catch (e) {
                    setUpdateError(raw || 'Failed to update preview display pin')
                }
                return
            }

            const body = await response.json()
            onUpdated && onUpdated(body)
        } catch (error) {
            setUpdateError(error.message || 'Failed to update preview display pin')
        } finally {
            setUpdateLoading(false)
        }
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Preview Display Pin'}
            maxWidth={'lg'}
            handleSubmit={onSubmitHandler}
            cancelText={'Cancel'}
            createText={'Confirm'}
            loading={confirmLoading}
        >
            {updateError ? (
                <Alert severity='error' style={{ marginBottom: '12px' }}>
                    {updateError}
                </Alert>
            ) : null}
            <Grid container spacing={2}>
                {pinList.map((item, index) => (
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
                                cursor: 'pointer',
                            }}
                            onClick={() => setSelectedPinId(item.id)}
                        >
                            {item.label}
                            <img
                                width='100%'
                                src={backend.IMAGE_LINK + item.display_path}
                                alt={item.label}
                            />
                        </div>
                    </Grid>
                ))}
            </Grid>
        </BaseForm>
    )
}

export default PreviewDisplayPinForm
