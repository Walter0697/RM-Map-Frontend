import React, { useState } from 'react'
import {
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from './BaseForm'

function RoroadListSearchForm({
    open,
    handleClose,
    searchName,
    setSearchName,
}) {
    const [ name, setName ] = useState(searchName)

    const onSearchHandler = async () => {
        setSearchName(name)
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Search RoroadList'}
            maxWidth={'lg'}
            handleSubmit={onSearchHandler}
            cancelText={'Cancel'}
            createText={'Search'}
            alertMessage={''}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} md={12} lg={12}>
                    <TextField
                        variant='outlined'
                        size='medium'
                        fullWidth
                        label='Name'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Grid>
            </Grid>
        </BaseForm>
    )
}

export default RoroadListSearchForm