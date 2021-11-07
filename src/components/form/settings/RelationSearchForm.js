import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery, useMutation } from '@apollo/client'
import { 
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from '../BaseForm'

import useDebounce from '../../../hooks/useDebounce'

import graphql from '../../../graphql'

function RelationSearchForm({
    selfname,
    open,
    handleClose,
    onCreated,
}) {
    const [ userSearchGQL, { data: searchData, loading: searchLoading, error: searchError } ] = useLazyQuery(graphql.users.search, { errorPolicy: 'all' })
    const [ updateRelationGQL, { data: relationData, loading: relationLoading, error: relationError } ] = useMutation(graphql.users.update_relation, { errorPolicy: 'all' })

    const [ username, setUsername ] = useState('')
    const [ helperText, setHelperText ] = useState('')
    const [ error, setError ] = useState(false)
    const [ canConfirm, setConfirm ] = useState(false)  // if there is no error and user is not typing

    const confirmClickable = useMemo(() => {
        if (!canConfirm) return false
        if (relationLoading) return false
        return true
    }, [canConfirm, relationLoading])

    const fetchUserWithUsername = () => {
        if (username === '') return
        userSearchGQL({ variables: { username } })
    }

    useEffect(() => {
        setConfirm(false)
        if (username === '') return

        setError(false)
        setHelperText('searching...')
    }, [username])

    useDebounce(fetchUserWithUsername, 1000, [ username ])

    useEffect(() => {
        if (username === '') return

        if (searchData) {
            if (searchData.usersearch) {
                if (searchData.usersearch.username === selfname) {
                    setError(true)
                    setConfirm(false)
                    setHelperText('you cannot share marker with yourself!')
                } else {
                    setError(false)
                    setConfirm(true)
                    setHelperText('you can share markers with this user!')
                }
            } else {
                setError(true)
                setConfirm(false)
                setHelperText('user not found')
            }
        }

        if (searchError) {
            setError(true)
            setHelperText(searchError)
        }
    }, [searchData, searchError])

    useEffect(() => {
        if (relationData) {
            if (relationData.updateRelation === 'ok') {
                onCreated && onCreated(username)
            } 
        }

        if (relationError) {
            // TODO: handle error to pop up alert
            console.log(relationError)
        }
    }, [relationData, relationError])

    const onSubmitHandler = () => {
        updateRelationGQL({ variables: { username }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Search User'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Confirm'}
                loading={!confirmClickable}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variable='outlined'
                            size='medium'
                            fullWidth
                            label='searching'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            error={error}
                            helperText={helperText}
                        />
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}

export default connect(state => ({
    selfname: state.auth.username,
})) (RelationSearchForm)