import React, { useState, useMemo, useEffect } from 'react'
import { connect } from 'react-redux'
import { useQuery, useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
} from '@mui/material'

import useObject from '../../hooks/useObject'

import BaseForm from './BaseForm'
import Selectable from '../field/Selectable'

import constants from '../../constant'
import actions from '../../store/actions'
import graphql from '../../graphql'

function RoroadListForm({
    open,
    handleClose,
    updatingItem,
    onCreated,
    onUpdated,
    dispatch,
}) {
    const [ createRoroadListGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.roroadlists.create, { errorPolicy: 'all' })
    const [ updateRoroadListGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.roroadlists.edit, { errorPolicy: 'all' })

    const { data: preferenceData, loading: preferenceLoading, error: preferenceError } = useQuery(graphql.users.preference, { errorPolicy: 'all', fetchPolicy: 'no-cache' })

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        name: '',
        target_user: '',
        list_type: '',
    })
    const [ error, setError ] = useObject({})

    const selectableUserList = useMemo(() => {
        if (preferenceData) {
            const result = []
            if (preferenceData?.preference?.relation?.username) {
                const relationUser = preferenceData?.preference?.relation?.username
                result.push({ label: relationUser, value: relationUser })
            }

            if (preferenceData?.preference?.user?.username) {
                const selfUser = preferenceData?.preference?.user?.username
                result.push({ label: selfUser, value: selfUser })
            }

            return result
        }

        return []
    }, [preferenceData])

    const title = useMemo(() => {
            if (!updatingItem) {
                return 'Create RoroadList'
            }
            return `Update ${updatingItem.name}`
    }, [updatingItem])

    const confirmText = useMemo(() => {
        if (!updatingItem) {
            return 'Create'
        }
        return 'Update'
    }, [updatingItem])

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    useEffect(() => {
        if (updatingItem) {
            setFormValue('name', updatingItem.name)
            setFormValue('target_user', updatingItem.target_user)
            setFormValue('list_type', updatingItem.list_type)
        } else {
            resetFormValue()
        }
        setSubmitting(false)
    }, [updatingItem, open])

    useEffect(() => {
        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (createData) {
            dispatch(actions.addRoroadList(createData.createRoroadList))
            setSubmitting(false)
            onCreated && onCreated()
        }
    }, [createData, createError])

    useEffect(() => {
        if (updateError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (updateData) {
            dispatch(actions.updateRoroadlist(updateData.updateRoroadList))
            setSubmitting(false)
            onUpdated && onUpdated()
        }
    }, [updateData, updateError])

    const onValueChangeHandler = (field, value) => {
        setFormValue(field, value)
        setError(field, '')
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        let hasError = false

        if (!formValue.name) {
            setError('name', 'name cannot be empty')
            hasError = true
        }

        if (!formValue.target_user) {
            setError('target_user', 'target user cannot be empty')
            hasError = true
        }

        if (!formValue.list_type) {
            setError('list_type', 'list type cannot be empty')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        if (updatingItem) {
            updateRoroadListGQL({ variables: {
                id: updatingItem.id, 
                name: formValue.name,
                target_user: formValue.target_user,
                list_type: formValue.list_type,
            }})
        } else {
            createRoroadListGQL({ variables: {
                name: formValue.name,
                target_user: formValue.target_user,
                list_type: formValue.list_type,
            }})
        } 
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={title}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={confirmText}
                loading={submitting}
                isSubmitUnauthorized={isUnauthorized}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            required
                            label='name'
                            value={formValue.name}
                            onChange={(e) => onValueChangeHandler('name', e.target.value)}
                            error={!!error.name}
                            helperText={error.name}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='target user'
                            value={formValue.target_user}
                            onValueChange={(e) => onValueChangeHandler('target_user', e.target.value)}
                            defaultSelectaValue={''}
                            defaultSelectText={''}
                            errorMessage={error.target_user}
                            noDefault
                            list={selectableUserList}
                            valueKey={'value'}
                            textKey={'label'}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <Selectable
                            label='list type'
                            value={formValue.list_type}
                            onValueChange={(e) => onValueChangeHandler('list_type', e.target.value)}
                            defaultSelectaValue={''}
                            defaultSelectText={''}
                            errorMessage={error.list_type}
                            noDefault
                            list={constants.listtype.list}
                            valueKey={'value'}
                            textKey={'label'}
                        />
                    </Grid>
                </Grid>
            </BaseForm>
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
})) (RoroadListForm)