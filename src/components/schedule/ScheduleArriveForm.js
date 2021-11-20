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

import actions from '../../store/actions'
import graphql from '../../graphql'

function ScheduleArriveForm({
    open,
    handleClose,
    onUpdated,
    schedule_list,
    dispatch,
}) {
    // graphql request
    const [ updateScheduleStatusGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.schedules.update_status, { errorPolicy: 'all' })

    const [ schedules, setSchedules] = useState([])

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    // set the schedule into a state variable
    useEffect(() => {
        setSchedules(schedule_list)
    }, [schedule_list])

    useEffect(() => {
        if (updateError) {
            setAlertMessage({
                type: 'error',
                message: updateError.message,
            })
            setSubmitting(false)
        }

        if (updateData) {
            // do something for the current state value
            //dispatch()
            onUpdated && onUpdated()
        }
    }, [updateData, updateError])

    // on button click handler
    const setStatusArrival = (index) => {
        const s = [...schedules]
        if (s[index].status === 'arrived') {
            s[index].status = ''
        } else {
            s[index].status = 'arrived'
        }
        setSchedules(() => s)
    }

    const setStatusCancel = (index) => {
        const s = [...schedules]
        if (s[index].status === 'cancelled') {
            s[index].status = ''
        } else {
            s[index].status = 'cancelled'
        }
        setSchedules(() => s)
    }

    const onSubmitHandler = async (e) => {
        let result = []
        console.log(schedules)
        schedules.forEach((s) => {
            result.push({
                id: s.id,
                status: s.status,
            })
        })
        
        updateScheduleStatusGQL({ variables: {
            input: result,
        }})
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'Where did you go~?'}
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
                {schedule_list.map((item, index) => (
                    <Grid key={index} item xs={12} md={12} lg={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={1} md={1} lg={1}>
                                <IconButton 
                                    size='small'
                                    onClick={() => setStatusArrival(index)}
                                >
                                    { item.status === 'arrived' ? (
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
                            <Grid item xs={1} md={1} lg={1}>
                                <IconButton 
                                    size='small'
                                    onClick={() => setStatusCancel(index)}
                                >
                                    { item.status === 'cancelled' ? (
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
                            <Grid item xs={10} md={10} lg={10}
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

export default ScheduleArriveForm