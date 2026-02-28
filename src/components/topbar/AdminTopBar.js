import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router'
import {
    Avatar,
    AppBar,
    Toolbar,
    Box,
    Stack,
    Typography,
} from '@mui/material'

import AutoHideAlert from '../AutoHideAlert'

function AdminTopBar({
    username,   // from redux
    label,
    alertOpen,
    alertMessage,
}) {
    const history = useHistory()
    
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
                    sx={{
                        background: 'linear-gradient(90deg, #0f8dbc 0%, #146a99 100%)',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    <Toolbar sx={{ minHeight: { xs: 58, sm: 62 } }}>
                        <Stack
                            direction='row'
                            alignItems='center'
                            justifyContent='space-between'
                            sx={{ width: '100%' }}
                        >
                            <Typography variant='h6' component='div' sx={{ fontWeight: 700 }}>
                                {label}
                            </Typography>
                            <Stack
                                direction='row'
                                spacing={1}
                                alignItems='center'
                            >
                                <Avatar
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        fontSize: 14,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'common.white',
                                    }}
                                >
                                    {username ? username.slice(0, 1).toUpperCase() : '?'}
                                </Avatar>
                                <Typography
                                    variant='body2'
                                    sx={{
                                        fontWeight: 600,
                                        display: { xs: 'none', sm: 'block' },
                                    }}
                                >
                                    {username}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Toolbar>
                </AppBar>
            </Box>
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
