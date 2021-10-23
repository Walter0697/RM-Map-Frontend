import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { 
    Grid,
    TextField,
} from '@mui/material'

import BaseForm from './BaseForm'

import graphql from '../../graphql'

function RelationSearchForm({
    open,
    handleClose,
    onCreated,
}) {
    const [ userSearchGQL, { data: searchData, loading: searchLoading, error: searchError } ] = useLazyQuery(graphql.users.search, { errorPolicy: 'all' })

    const [ username, setUsername ] = useState('')

    useEffect(() => {

    }, [username])

    useEffect(() => {

    }, [ searchData, searchError ])

    const onSubmitHandler = () => {

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
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}

export default RelationSearchForm