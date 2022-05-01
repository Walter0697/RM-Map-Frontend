import React, { useState, useEffect } from 'react'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from '../BaseForm'

function FreeTextEdit({
    open,
    handleClose,
    text,
    onConfirm,
}) {
    const [ value, setValue ] = useState(text)

    useEffect(() => {
        setValue(text)
    }, [text])

    const onConfirmHandler = () => {
        onConfirm(value)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Free Text Edit'}
            maxWidth={'lg'}
            handleSubmit={onConfirmHandler}
            cancelText={'Cancel'}
            createText={'Confirm'}
            loading={false}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                    <TextField
                        variant='outlined'
                        size='medium'
                        fullWidth
                        label='Free Text'
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                    <div>Use & to separate different key words</div>
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default FreeTextEdit