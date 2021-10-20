import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'
import { 
    Box,
    Grid,
    TextField,
    LinearProgress,
} from '@mui/material'
import { 
    LoadingButton,
} from '@mui/lab'
import useMobileDetect from 'use-mobile-detect-hook'

import LockOpenIcon from '@mui/icons-material/LockOpen'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

import useObject from '../hooks/useObject'
import useOpacityTransition from '../hooks/useOpacityTransition'

import actions from '../store/actions'
import apis from '../apis'

import styles from '../styles/login.module.css'

function Login({ jwt, dispatch }) {
    // for environment
    const detectMobile = useMobileDetect()
    const history = useHistory()

    // state variables
    const [ loginState, setLoginState ] = useState('prompt') // prompt, loading, success
    const [ loginInfo, setLoginInfo ] = useObject({
        username: '',
        password: '',
    })
    const [ error, setError ] = useObject({})

    // to lock button from being pressed
    const [ sending, setSending ] = useState(false)

    // for loading screen
    const [ animationEnd, setEnd ] = useState(false)
    const [ informationFetched, setFetch ] = useState(false)

    const formWidth = detectMobile.isMobile() ? '90%' : '30%'
    const iconWidth = detectMobile.isMobile() ? '35%' : '15%'

    // animation related
    const { ...rest } = useSpring({
        config: config.stiff,
        from: { height: '10%', width: '10%', opacity: 1 },
        to: {
            height: (loginState === 'prompt') ? '60%' : (loginState === 'success' || loginState === 'redirecting' ? '20%' : '5%'),
            width: (loginState === 'success' || loginState === 'redirecting') ? iconWidth : formWidth,
            opacity: (loginState === 'redirecting') ? 0 : 1,
        },
    })

    // transition animation for the form
    const transition = useOpacityTransition(loginState)

    // check login state to perform different action
    useEffect(() => {
        if (loginState === 'loading') {
            onInformationFetch()
            onAnimationRun()
        } else if (loginState === 'success') {
            // set time out for changing form shape
            window.setTimeout(() => {
                setLoginState('redirecting')
            }, 1000)
        } else if (loginState === 'redirecting') {
            // set time out for switching page
            window.setTimeout(() => {
                history.replace('/search')
            }, 500)
        }
    }, [loginState])

    // make sure that animation and information both ended before going to successful page
    useEffect(() => {
        if (animationEnd && informationFetched) {
            setLoginState('success')
        }
    }, [animationEnd, informationFetched])

    // fetching animation related
    const onInformationFetch = async () => {
        const response = await apis.markers.list()
        console.log(response)
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

        try {
            const { data } = await apis.auth.login(loginInfo.username, loginInfo.password)
            if (!data.errors) {
                dispatch(actions.login(data.data.login))
                setLoginState('loading')
            } else {
                setError('password', 'username or password error')
            }
            setSending(false)
        } catch (e) {
            setError('password', 'request failed')
            setSending(false)
        }
    }

    // render layer for different shape of the input form
    const renderLayer = (state) => {
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
                            <Box mt={10}>
                                <LoadingButton
                                    fullWidth
                                    variant="outlined"
                                    type="submit"
                                    endIcon={<LockOpenIcon />}
                                    loading={sending}
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
                        <CheckCircleOutlineIcon sx={{ fontSize: 90, color: '#a6ffbd' }}/>
                    </Grid>
                )
        }
    }

    return (
       <div className={styles.wrapper}>
            <animated.div
                style={{ ...rest }}
                className={styles.container}
            >
                <Grid
                    container
                    fullWidth
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="center"
                >
                    {transition( ( { opacity }, item ) => (
                        <animated.div
                            style={{
                                width: '90%',
                                position: 'absolute',
                                opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1]}),
                            }}
                        >
                            {renderLayer(item)}
                        </animated.div>
                    ))}
                </Grid>
            </animated.div>
        </div>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(Login)