import React from 'react'
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
} from '@mui/material'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
    abRoot: {
      backgroundColor: '#11abdb',
    },
  })
)

function TopBar({ label }) {
    const classes = useStyles()
    return (
        <Box sx={{ flexGrow: 1}}>
            <AppBar 
                position='static' 
                classes={{
                    root: classes.abRoot,
                }}
            >
                <Toolbar>
                    <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                        {label}
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default TopBar