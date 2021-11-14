
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router'
import {
    useSpring,
    config,
    animated,
} from '@react-spring/web'

import { useLazyQuery } from '@apollo/client'

import useBoop from '../hooks/useBoop'

import BottomBar from '../components/bottombar/BottomBar'
 
import actions from '../store/actions'
import graphql from '../graphql'

import styles from '../styles/bottom.module.css'

function Base({ 
    children,
    jwt,
    dispatch,
}) {
    // for environment 
    const history = useHistory()

    // graphql request
    const [ meGQL, { error: meError }]  = useLazyQuery(graphql.auth.me, { errorPolicy: 'all', fetchPolicy: 'no-cache' })

    // variable for blinking animation when switching pages
    const [ blink, refresh ] = useBoop(300)

    useEffect(() => {
        if (!jwt) {
            dispatch(actions.logout())
            history.replace('/login')
        }
        meGQL()
    }, [])

    useEffect(() => {
        // we only care about the error
        if (meError) {
            if (meError.message === 'permission denied') {
                dispatch(actions.logout())
                history.replace('/login')
            }
        }
    }, [meError])

    const { x } = useSpring({
        config: config.gentle,
        from: { x: 0 },
        x: blink ? 0 : 1,
    })
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
                {children}
            </animated.div>
            <BottomBar onChangeClick={refresh}/>
        </>
    )
}


export default connect(state => ({
    jwt: state.auth.jwt
}))(Base)