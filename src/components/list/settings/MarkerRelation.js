import React from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

function MarkerRelation({
    relationUser,
    openRelationChange,
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
            onClick={openRelationChange}
        >
            <Grid
                container fullWidth
            >
                <Grid item xs={12}>Sharing markers with:</Grid>
                <Grid item xs={12}>{relationUser ?? '<nobody>'}</Grid>
            </Grid>
        </Button>
    )
}

export default MarkerRelation