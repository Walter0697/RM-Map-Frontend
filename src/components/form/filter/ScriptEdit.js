import React, { useState, useEffect } from 'react'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from '../BaseForm'

function ScriptEdit({
    open,
    handleClose,
    script,
    onConfirm,
}) {
    const [ value, setValue ] = useState(script)

    useEffect(() => {
        setValue(script)
    }, [script])

    const onConfirmHandler = () => {
        onConfirm(value)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Script Edit'}
            maxWidth={'lg'}
            handleSubmit={onConfirmHandler}
            cancelText={'Cancel'}
            createText={'Confirm'}
            loading={false}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default ScriptEdit