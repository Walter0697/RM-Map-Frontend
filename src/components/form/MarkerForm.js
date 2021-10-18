import React, { useState, useEffect } from 'react'
import {
    Grid,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide
} from '@mui/material'
import dayjs from 'dayjs'

import useObject from '../../hooks/useObject'

import maphelper from '../map/maphelper'

const TransitionUp = (props) => {
    return <Slide {...props} direction="up" />
}

function MarkerForm({
    open,
    handleClose,
    location,
}) {
    const [ formValue, setFormValue ] = useObject({
        label: '',
        address: '',
        imageLink: '',
        link: '',
        type: '',
        description: '',
        to_time: '',
        from_time: '',
    })
    const [ error, setError ] = useObject({})

    const [ submitting, setSubmitting ] = useState(false)

    useEffect(() => {
        if (!location) return
        const address = maphelper.generic.getAddress(location.details.address)
        console.log(location)
        console.log(address)
        setFormValue('address', address)
    }, [location])

    const onLabelChangeHandler = (e) => {
        setFormValue('label', e.target.value)
        setError('label', '')
    }

    const onAddressChangeHandler = (e) => {
        setFormValue('address', e.target.value)
        setError('address', '')
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        setSubmitting(false)
    }

    return (
        <Dialog
            fullWidth
            maxWidth={'lg'}
            open={open}
            TransitionComponent={TransitionUp}
            onClose={handleClose}
            scroll={'paper'}
        >
            <DialogTitle>Create Marker</DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={12} lg={12}>
                            <TextField
                                variant='outlined'
                                fullWidth
                                label='label'
                                value={formValue.label}
                                onChange={onLabelChangeHandler}
                                error={!!error.label}
                                helperText={error.label}
                            />
                        </Grid>
                        <Grid item xs={6} md={6} lg={6}>
                            <TextField
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                variant='outlined'
                                size='small'
                                fullWidth
                                label="longitude"
                                value={location ? location.location.lon : ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6} md={6} lg={6}>
                            <TextField
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                variant='outlined'
                                size='small'
                                fullWidth
                                label="latitude"
                                value={location ? location.location.lat : ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} md={12} lg={12}>
                            <TextField
                                variant='outlined'
                                fullWidth
                                label='address'
                                value={formValue.address}
                                onChange={onAddressChangeHandler}
                                error={!!error.address}
                                helperText={error.address}
                            />
                        </Grid>
                    </Grid>
                    {JSON.stringify(location)}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleClose}>Create</Button>
            </DialogActions>
        </Dialog>
    )
}

export default MarkerForm