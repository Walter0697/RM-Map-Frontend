
import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router'
import { useLocation } from 'react-router-dom'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import { Alert } from '@mui/material'

import { useLazyQuery } from '@apollo/client'

import useBoop from '../hooks/useBoop'

import BottomBar from '../components/bottombar/BottomBar'
 
import actions from '../store/actions'
import graphql from '../graphql'
import httpScript from '../scripts/http'
import deepLinkScript from '../scripts/deepLink'
import { getDesktopLayoutPage } from '../constant/layoutContract'

import styles from '../styles/bottom.module.css'

function Base({ 
    children,
    jwt,
    pendingDeepLink,
    dispatch,
    desktopPageKey,
}) {
    // for environment 
    const history = useHistory()
    const location = useLocation()

    // graphql request
    const [ meGQL, { error: meError }]  = useLazyQuery(graphql.auth.me, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
    const [ authStatusMessage, setAuthStatusMessage ] = useState('')
    const consumedDeepLinkPathRef = useRef(null)

    // variable for blinking animation when switching pages
    const [ blink, refresh ] = useBoop(300)

    useEffect(() => {
        const parsedIntent = deepLinkScript.parsePath(location.pathname)
        if (!parsedIntent) {
            consumedDeepLinkPathRef.current = null
            return
        }
        if (consumedDeepLinkPathRef.current === parsedIntent.path) return
        if (pendingDeepLink && pendingDeepLink.path === parsedIntent.path) {
            consumedDeepLinkPathRef.current = parsedIntent.path
            return
        }
        consumedDeepLinkPathRef.current = parsedIntent.path
        dispatch(actions.setDeepLinkIntent(parsedIntent))
    }, [location.pathname, pendingDeepLink, dispatch])

    useEffect(() => {
        if (!jwt) {
            dispatch(actions.logout())
            history.replace('/login')
            return
        }
        meGQL()
    }, [jwt, dispatch, history, meGQL])

    useEffect(() => {
        // we only care about the error
        if (meError) {
            const message = meError.message || ''
            if (httpScript.isAuthStateUnavailableError(message)) {
                setAuthStatusMessage(httpScript.AUTH_STATE_UNAVAILABLE_UI_MESSAGE)
                return
            }
            if (meError.message === 'permission denied') {
                dispatch(actions.clearDeepLinkIntent())
                dispatch(actions.logout())
                history.replace('/login')
            }
        }
    }, [meError, dispatch, history])

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: blink ? 0 : 1,
    })
    const desktopLayout = getDesktopLayoutPage(desktopPageKey)
    const innerClassName = [
        styles.baseInner,
        desktopLayout ? styles.desktopScoped : '',
    ].filter(Boolean).join(' ')
    const desktopScopedStyle = desktopLayout ? {
        '--desktop-max-width': `${desktopLayout.maxWidth}px`,
        '--desktop-horizontal-padding': `${desktopLayout.horizontalPadding}px`,
        '--desktop-vertical-padding': `${desktopLayout.verticalPadding}px`,
    } : null

    return (
        <>
            <animated.div
                style={{
                    opacity: x.to({
                        range: [0, 1],
                        output: [0, 1],
                    }),
                }}
                className={styles.base}
            >
                <div
                    className={innerClassName}
                    style={desktopScopedStyle || undefined}
                    data-desktop-layout-page={desktopPageKey || 'none'}
                >
                    {authStatusMessage ? (
                        <Alert severity='warning' sx={{ mb: 1.5 }}>
                            {authStatusMessage}
                        </Alert>
                    ) : null}
                    {children}
                </div>
            </animated.div>
            <BottomBar onChangeClick={refresh}/>
        </>
    )
}


export default connect(state => ({
    jwt: state.auth.jwt,
    pendingDeepLink: state.deepLink.pending,
}))(Base)
