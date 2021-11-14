import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router'
import { useMutation } from '@apollo/client'
import {
    Grid,
    Button,
} from '@mui/material'

import actions from '../../../store/actions'
import graphql from '../../../graphql'

function LogoutButton({
    setLoading,
    jwt,
    dispatch,
}) {
    // for environment 
    const history = useHistory()

    // graphql request
    const [ logoutGQL, { data: logoutData, loading: logoutLoading, error: logoutError } ] = useMutation(graphql.auth.logout, { errorPolicy: 'all' })

    useEffect(() => {
        if (logoutData) {
            dispatch(actions.logout())
            history.replace('/login')
        }

        if (logoutLoading) {
            setLoading(logoutLoading)
        }

        if (logoutError) {
            dispatch(actions.logout())
            history.replace('/login')
        }
    }, [logoutData, logoutLoading, logoutError])

    const tryLogout = () => {
        if (!confirm('confirm to logout')) return
        logoutGQL({ variables: { jwt } })
    }

    return (
        <Button
            size='large'
            style={{
                backgroundColor: '#48acdb',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
            }}
            onClick={tryLogout}
        >
            <Grid 
                container fullWidth
            >
                <Grid item xs={12}>Logout</Grid>
            </Grid>
        </Button>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt
}))(LogoutButton)