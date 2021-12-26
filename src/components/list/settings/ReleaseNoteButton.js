import React from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

function ReleaseNoteButton({
    latestVersion,
    seen,
    onClickHandler,
}) {
    return (
        <Button
            size='large'
            style={{
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
            }}
            onClick={onClickHandler}
        >
            <Grid 
                container fullWidth>
                <Grid item xs={12}>Release Notes {latestVersion !== seen && '*NEW*'}</Grid>
            </Grid>
        </Button>
    )
}

export default ReleaseNoteButton