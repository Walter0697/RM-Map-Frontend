import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
    IconButton,
} from '@mui/material'

import GolfCourseIcon from '@mui/icons-material/GolfCourse'
import CancelIcon from '@mui/icons-material/Cancel'

import BaseForm from '../form/BaseForm'

import constants from '../../constant'
import actions from '../../store/actions'
import graphql from '../../graphql'

function ScheduleArriveForm({
    open,
    handleClose,
    onUpdated,
    schedule_list,
    setYesterday,
    dispatch,
}) {
    // graphql request
    const [ updateScheduleStatusGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.schedules.update_status, { errorPolicy: 'all' })

    const [ arrivalSchedules, setSchedules] = useState([])

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    // set the schedule into a state variable
    useEffect(() => {
        let current = []
        schedule_list.forEach(s => {
            current.push({
                id: s.id,
                status: s.status,
                label: s.label,
            })
        })
        setSchedules(() => current)
    }, [schedule_list, open])

    useEffect(() => {
        if (updateError) {
            setAlertMessage({
                type: 'error',
                message: updateError.message,
            })
            setSubmitting(false)
        }

        if (updateData) {
            // update current state value
            let markers = []
            updateData.updateScheduleStatus.forEach(s => {
                if (s.marker) {
                    markers.push(s.marker)
                }
            })
            
            dispatch(actions.updateSchedulesStatus(updateData.updateScheduleStatus))
            dispatch(actions.updateMarkersStatus(markers))
            onUpdated && onUpdated()
        }
    }, [updateData, updateError])

    // on button click handler
    const setStatusArrival = (index) => {
        const s = [...arrivalSchedules]
        if (s[index].status === constants.status.arrived) {
            s[index].status = ''
        } else {
            s[index].status = constants.status.arrived
        }
        setSchedules(() => s)
    }

    const setStatusCancel = (index) => {
        const s = [...arrivalSchedules]
        if (s[index].status === constants.status.cancelled) {
            s[index].status = ''
        } else {
            s[index].status = constants.status.cancelled
        }
        setSchedules(() => s)
    }

    const onSubmitHandler = async (e) => {
        let missingStatus = false

        let result = []
        arrivalSchedules.forEach((s) => {
            if (!s.status) {
                missingStatus = true
            }
            result.push({
                id: s.id,
                status: s.status,
            })
        })
        
        if (setYesterday && missingStatus) {
            setAlertMessage({
                type: 'error',
                message: 'please set all schedules status',
            })
            return
        }

        updateScheduleStatusGQL({ variables: {
            input: result,
        }})
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={setYesterday ? 'Where did you go~?' : 'You arrived~?'}
            maxWidth={'lg'}
            handleSubmit={onSubmitHandler}
            cancelText={'Cancel'}
            createText={'Update'}
            loading={submitting}
            isSubmitUnauthorized={isUnauthorized}
            alertMessage={alertMessage}
            clearAlertMessage={() => setAlertMessage(null)}
        >
            <Grid container spacing={2}>
                {arrivalSchedules.map((item, index) => (
                    <Grid key={index} item xs={12} md={12} lg={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={3} md={3} lg={3}>
                                <Grid container spacing={3}>
                                    <Grid item xs={6} md={6} lg={6}>
                                        <IconButton 
                                            size='small'
                                            onClick={() => setStatusArrival(index)}
                                        >
                                            { item.status === constants.status.arrived ? (
                                                <GolfCourseIcon 
                                                    sx={{ color: '#2c6cff'}}
                                                />
                                            ): (
                                                <GolfCourseIcon 
                                                    sx={{ color : '#c0c2cc'}}
                                                />
                                            )}
                                        
                                    </IconButton>
                                    </Grid>
                                    <Grid item xs={6} md={6} lg={6}>
                                        <IconButton 
                                            size='small'
                                            onClick={() => setStatusCancel(index)}
                                        >
                                            { item.status === constants.status.cancelled ? (
                                                <CancelIcon 
                                                    sx={{ color: '#de155d'}}
                                                />
                                            ): (
                                                <CancelIcon 
                                                    sx={{ color : '#c0c2cc'}}
                                                />
                                            )}
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={9} md={9} lg={9}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: '30px',
                                }}
                            >
                                {item.label}
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </BaseForm>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(ScheduleArriveForm)