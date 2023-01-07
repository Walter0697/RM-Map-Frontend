import React, { useState, useEffect } from 'react'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from './BaseForm'


function LatLonLocationForm({
    open,
    handleClose,
    onFinished,
}) {
    const [ latlonCode, setLatLonCode ] = useState('')
    const [ loading, setLoading ] = useState(false)
    const [ alertMessage, setAlertMessage ] = useState(null)

    const onSearchHandler = async () => {
        setLoading(true)
        const code = latlonCode.split(',')
        onFinished({
            lat: code[0].trim(),
            lon: code[1].trim(),
        })
        setLoading(false)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Search By Open Location Code'}
            maxWidth={'lg'}
            handleSubmit={onSearchHandler}
            cancelText={'Cancel'}
            createText={'Search'}
            loading={loading}
            alertMessage={alertMessage}
            clearAlertMessage={() => setAlertMessage(null)}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                    <TextField
                        variant='outlined'
                        size='medium'
                        fullWidth
                        label='LatLon Code (lat,lon)'
                        value={latlonCode}
                        onChange={(e) => setLatLonCode(e.target.value)}
                    />
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default LatLonLocationForm