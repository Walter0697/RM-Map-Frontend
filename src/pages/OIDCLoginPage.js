import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
import { Box, LinearProgress, Typography } from '@mui/material'

import backend from '../constant/backend'

function OIDCLoginPage() {
    const history = useHistory()
    const authBackend = backend.AUTH_BACKEND

    useEffect(() => {
        const redirectToOIDC = async () => {
            if (!authBackend) {
                history.replace('/login')
                return
            }

            try {
                const response = await fetch(`${authBackend}/mode`)
                const body = await response.json()
                if (response.ok && body.mode === 'oidc') {
                    window.location.assign(`${authBackend}/oidc/start`)
                    return
                }
            } catch (e) {
                // Fall back to local login screen if mode check is unavailable.
            }

            history.replace('/login')
        }

        redirectToOIDC()
    }, [authBackend, history])

    return (
        <Box sx={{ width: '100%', maxWidth: 480, margin: '20vh auto', px: 2 }}>
            <Typography align="center" sx={{ mb: 2 }}>
                Checking login mode...
            </Typography>
            <LinearProgress />
        </Box>
    )
}

export default OIDCLoginPage
