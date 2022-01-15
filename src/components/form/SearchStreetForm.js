import React, { useState } from 'react'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from './BaseForm'

import apis from '../../apis'

function SearchStreetForm({
    open,
    handleClose,
    onFinished,
}) {
    const [ streetName, setStreetName ] = useState('')
    const [ loading, setLoading ] = useState(false)
    const [ alertMessage, setAlertMessage ] = useState(null)

    const onSearchHandler = async () => {
        setLoading(true)
        const number = parseInt(streetName)
        const name = streetName.replace(number, '').trim().replaceAll(' ', '%20')
        const result = await apis.maps.geocode(number, name)
        if (result.data.results.length === 0) {
            setAlertMessage({ type: 'warning', message: 'Cannot find any result' })
        } else {
            const location = result.data.results[0]
            const address = location.address.freeformAddress ?? streetName
            const lonlat = location.position
            onFinished(lonlat, address)
        }
        setLoading(false)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Search By Street Name'}
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
                        label='Street Name'
                        value={streetName}
                        onChange={(e) => setStreetName(e.target.value)}
                    />
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default SearchStreetForm