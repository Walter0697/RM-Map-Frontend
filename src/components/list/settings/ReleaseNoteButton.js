import React from 'react'
import {
    Grid,
    Button,
} from '@mui/material'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'

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
                textTransform: 'none',
            }}
            onClick={onClickHandler}
        >
            <Grid 
                container
                fullWidth
                style={{ alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
                <DescriptionOutlinedIcon fontSize='small' />
                <Grid item>Release Notes {latestVersion !== seen && '*NEW*'}</Grid>
            </Grid>
        </Button>
    )
}

export default ReleaseNoteButton
