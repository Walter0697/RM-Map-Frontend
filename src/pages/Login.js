import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router'
import { useMutation } from '@apollo/client'
import { 
    Box,
    Grid,
    Alert,
    TextField,
    Typography,
    LinearProgress,
} from '@mui/material'
import { 
    LoadingButton,
} from '@mui/lab'
import useMobileDetect from 'use-mobile-detect-hook'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import Logo from '../images/logo.png'

import useObject from '../hooks/useObject'

import actions from '../store/actions'
import graphql from '../graphql'
import backend from '../constant/backend'
import httpScript from '../scripts/http'
import deepLinkScript from '../scripts/deepLink'
import { consumeTerminalUnauthorizedMessage } from '../scripts/authSession'

import styles from '../styles/login.module.css'

function Login({ jwt, pendingDeepLink, dispatch }) {
    // for environment
    const detectMobile = useMobileDetect()
    const history = useHistory()
    const authBackend = backend.AUTH_BACKEND
    const callbackParams = useMemo(() => {
        const url = new URL(window.location.href)
        return {
            token: url.searchParams.get('token'),
            username: url.searchParams.get('username'),
        }
    }, [])

    // graphql request
    const [ loginGQL, { data: loginData, loading: loginLoading, error: loginError } ] = useMutation(graphql.auth.login, { errorPolicy: 'all' })
    const [ loginResult, setLoginResult ] = useState(null)

    // state variables
    const [ loginState, setLoginState ] = useState('prompt') // prompt, loading, success
    const [ loginInfo, setLoginInfo ] = useObject({
        username: '',
        password: '',
    })
    const [ error, setError ] = useObject({})
    const [ authMode, setAuthMode ] = useState('local-password')
    const [ modeLoading, setModeLoading ] = useState(true)
    const [ terminalMessage, setTerminalMessage ] = useState('')

    // to lock button from being pressed
    const [ sending, setSending ] = useState(false)

    // for loading screen
    const [ animationEnd, setEnd ] = useState(false)
    const [ informationFetched, setFetch ] = useState(false)
    const animationNext = useMemo(() => {
        if (!animationEnd) return false
        if (!informationFetched) return false
        return true
    }, [animationEnd, informationFetched])

    // if jwt exists, just redirect to home screen
    useEffect(() => {
        if (jwt) {
            const nav = deepLinkScript.resolvePostLoginNavigation(pendingDeepLink)
            if (nav.shouldIncrementReplay) {
                dispatch(actions.incrementDeepLinkReplay())
            }
            if (nav.shouldClearIntent) {
                dispatch(actions.clearDeepLinkIntent())
            }
            history.replace(nav.path)
        }
    }, [jwt, pendingDeepLink, dispatch, history])

    useEffect(() => {
        const callbackToken = callbackParams.token
        const callbackUsername = callbackParams.username
        if (callbackToken && callbackUsername) {
            dispatch(actions.login(callbackToken, callbackUsername))
            window.history.replaceState({}, document.title, '/login')
        }
    }, [dispatch, callbackParams])

    useEffect(() => {
        const message = consumeTerminalUnauthorizedMessage()
        if (message) {
            setTerminalMessage(message)
        }
    }, [])

    useEffect(() => {
        const loadMode = async () => {
            if (jwt || (callbackParams.token && callbackParams.username)) {
                setModeLoading(false)
                return
            }

            if (!authBackend) {
                setModeLoading(false)
                return
            }

            try {
                const response = await fetch(`${authBackend}/mode`)
                const body = await response.json()
                if (!response.ok) {
                    setModeLoading(false)
                    return
                }

                setAuthMode(body.mode === 'oidc' ? 'oidc' : 'local-password')
            } catch (e) {
                setAuthMode('local-password')
            }
            setModeLoading(false)
        }

        loadMode()
    }, [authBackend, jwt, callbackParams])

    // check login state to perform different action
    useEffect(() => {
        let timer = null
        if (loginState === 'loading') {
            onInformationFetch()
            onAnimationRun()
        } else if (loginState === 'success') {
            // set time out for changing form shape
            timer = window.setTimeout(() => {
                setLoginState('redirecting')
            }, 1000)
        } else if (loginState === 'redirecting') {
            // set time out for switching page
            timer = window.setTimeout(() => {
                //history.replace('/home')
                dispatch(actions.login(loginResult.jwt, loginResult.username))
            }, 500)
        }
        return () => { timer && window.clearTimeout(timer) }
    }, [loginState, loginResult])

    // make sure that animation and information both ended before going to successful page
    useEffect(() => {
        if (animationNext) {
            setLoginState('success')
        }
    }, [animationNext])

    // handling graphql request result
    useEffect(() => {
        if (loginError) {
            setError('password', httpScript.toAuthAwareErrorMessage(loginError, 'Login failed'))
            setSending(false)
        }

        if (loginData) {
            //dispatch(actions.login(loginData.login.jwt, loginData.login.username))
            setLoginResult(loginData.login)
            setLoginState('loading')
        }
    }, [loginData, loginError])

    // fetching animation related
    const onInformationFetch = async () => {
        setFetch(true)
    }

    // fake an animation for user to make it seems like loading, if fetching time is fast enough, this will at least last for 2 seconds
    const onAnimationRun = () => {
        window.setTimeout(() => {
            setEnd(true)
        }, 2000)
    }

    // text field function
    const onUsernameChangeHandler = (e) => {
        setLoginInfo('username', e.target.value)
        setError('username', '')
    }

    const onPasswordChangeHandler = (e) => {
        setLoginInfo('password', e.target.value)
        setError('password', '')
    }

    // login handler
    const loginHandler = async (e) => {
        e.preventDefault()
        if (sending) return
        setSending(true)

        let hasError = false

        if (loginInfo.username === '') {
            setError('username', 'username is required')
            hasError = true
        }

        if (loginInfo.password === '') {
            setError('password', 'password is required')
            hasError = true
        }

        if (hasError) {
            setSending(false)
            return
        }

        loginGQL({ variables: { username: loginInfo.username, password: loginInfo.password }})
    }

    const loginWithOIDCHandler = () => {
        if (!authBackend) return
        window.location.assign(`${authBackend}/oidc/start`)
    }

    // render layer for different shape of the input form
    const renderLayer = (state) => {
        if (modeLoading) {
            return <LinearProgress />
        }

        if (authMode === 'oidc') {
            return (
                <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body1" align="center">
                            Login is handled by OIDC in this environment.
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <LoadingButton
                            fullWidth
                            variant="outlined"
                            onClick={loginWithOIDCHandler}
                            endIcon={<LockOpenIcon />}
                            size="large"
                        >
                            LOGIN WITH OIDC
                        </LoadingButton>
                    </Grid>
                </Grid>
            )
        }

        switch (state) {
            case 'prompt':
                return (
                    <form onSubmit={loginHandler} noValidate>
                        <Grid item xs={12}>
                            <Box mt={3}>
                                <TextField
                                    variant="outlined"
                                    label="username"
                                    fullWidth
                                    value={loginInfo.username}
                                    onChange={onUsernameChangeHandler}
                                    error={!!error.username}
                                    helperText={error.username}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box mt={3}>
                                <TextField
                                    type="password"
                                    variant="outlined"
                                    label="password"
                                    fullWidth
                                    value={loginInfo.password}
                                    onChange={onPasswordChangeHandler}
                                    error={!!error.password}
                                    helperText={error.password}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box mt={4}>
                                <LoadingButton
                                    fullWidth
                                    variant="outlined"
                                    type="submit"
                                    endIcon={<LockOpenIcon />}
                                    loading={sending || loginLoading}
                                    loadingPosition="end"
                                    size="large"
                                >
                                LOGIN
                                
                                </LoadingButton>
                            </Box>
                        </Grid>
                    </form>
                )
            case 'loading':
                return (
                    <LinearProgress />
                )
            default:
                return (
                    <Grid container
                        fullWidth
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center"
                    >
                        <CheckCircleOutlineIcon sx={{ fontSize: 90, color: '#b2d2a4' }}/>
                    </Grid>
                )
        }
    }

    return (
       <div className={styles.wrapper}>
            <div className={styles.container}>
                {terminalMessage ? (
                    <Alert severity='warning' sx={{ mb: 2, width: '100%' }}>
                        {terminalMessage}
                    </Alert>
                ) : null}
                <div className={styles.iconWrap}>
                    <img
                        src={Logo}
                        alt='RoRoadMap'
                        className={styles.loginLogo}
                    />
                </div>
                <div style={{ width: '100%' }}>
                    {renderLayer(loginState)}
                </div>
            </div>
        </div>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
    pendingDeepLink: state.deepLink.pending,
}))(Login)
