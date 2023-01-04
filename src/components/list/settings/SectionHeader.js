import React from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

function SectionHeader({
    icon,
    title,
}) {
    return (
        <Button
            size='large'
            style={{
                backgroundColor: '#bbe9ff',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                textTransform: 'none',
            }}
        >
            <Grid 
                container 
                fullWidth
                style={{
                    paddingTop: '6px',
                }}
            >
                <Grid item xs={3}>
                    {icon}
                </Grid>
                <Grid item xs={6}>
                    {title}
                </Grid>
            </Grid>
        </Button>
    )
}

export default SectionHeader