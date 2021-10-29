import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router'
import {
    IconButton,
    AppBar,
    Toolbar,
    Box,
    Typography,
} from '@mui/material'
import { makeStyles } from '@mui/styles'

import MenuIcon from '@mui/icons-material/Menu'

import AdminRouteDialog from './AdminRouteDialog'
import AutoHideAlert from '../AutoHideAlert'

const useStyles = makeStyles(() => ({
    abRoot: {
      backgroundColor: '#11abdb',
    },
  })
)

function AdminTopBar({
    username,   // from redux
    label,
    alertOpen,
    alertMessage,
}) {
    const classes = useStyles()
    const history = useHistory()

    const [ routeOpen, setRouteOpen ] = useState(false)
    
    useEffect(() => {
        if (!username) {
            history.replace('/')
        }
    }, [username])

    return (
        <>
            <Box sx={{ flexGrow: 1}}>
                <AppBar 
                    position='static' 
                    classes={{
                        root: classes.abRoot,
                    }}
                >
                    <Toolbar>
                        <IconButton
                             size='large'
                             edge='start'
                             color='inherit'
                             sx={{ mr: 2 }}
                             onClick={() => setRouteOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                            {label}
                        </Typography>
                        <Typography variant='h7' component='div' sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                            {username}
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Box>
            <AdminRouteDialog
                open={routeOpen}
                handleClose={() => setRouteOpen(false)}
            />
            <AutoHideAlert
                open={alertOpen}
                type={'success'}
                message={alertMessage}
                timing={2000}
            />
        </>
    )
}

export default connect(state => ({
    username: state.auth.username,
}))(AdminTopBar)