import React from 'react'
import {
    IconButton,
    AppBar,
    Toolbar,
    Box,
    Badge,
    Typography,
} from '@mui/material'
import { makeStyles } from '@mui/styles'

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import FactCheckIcon from '@mui/icons-material/FactCheck'

const useStyles = makeStyles(() => ({
    abRoot: {
      backgroundColor: '#11abdb',
    },
  })
)

function TopBar({ 
    label,
    onBackHandler,
    pendingCount = 0,
    onPendingClick,
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
                    {onPendingClick ? (
                        <IconButton color='inherit' aria-label='Pending markers' onClick={onPendingClick}>
                            <Badge color='error' badgeContent={pendingCount} invisible={pendingCount === 0}>
                                <FactCheckIcon />
                            </Badge>
                        </IconButton>
                    ) : null}
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default TopBar
