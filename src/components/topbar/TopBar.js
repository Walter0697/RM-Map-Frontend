import React from 'react'
import {
    IconButton,
    AppBar,
    Toolbar,
    Box,
    Typography,
} from '@mui/material'
import { makeStyles } from '@mui/styles'

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'

const useStyles = makeStyles(() => ({
    abRoot: {
      backgroundColor: '#11abdb',
    },
  })
)

function TopBar({ 
    label,
    onBackHandler,
}) {
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
                    {onBackHandler && (
                        <IconButton
                            size='large'
                            style={{
                                marginRight: '5px',
                                color: 'white',
                            }}
                            onClick={onBackHandler}
                        >
                            <ArrowBackIosIcon />
                        </IconButton>
                    )}
                    <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                        {label}
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default TopBar