import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Button,
    IconButton,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Grid,
    Slide,
} from '@mui/material'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CancelIcon from '@mui/icons-material/Cancel'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import useBoop from '../../hooks/useBoop'

import AutoHideAlert from '../AutoHideAlert'
import RestaurantCard from '../card/RestaurantCard'
import RoundImage from '../wrapper/RoundImage'

import constants from '../../constant'
import actions from '../../store/actions'
import graphql from '../../graphql'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function ScheduleItem({
    item,
    triggerCopyMessage,
    isToday,
    onEditClick,
    onDeleteClick,
}) {
    // const imageLink = useMemo(() => {
    //     // if (!item || !item.marker) return ''
        
    //     // return markerhelper.image.marker_image(item.marker, eventtypes)
    //     return item.image_path
    // }, [item, eventtypes])  // if marker has image, use this, if not, use the type image

    const [ imageExist, setImageExist ] = useState(false)

    useEffect(() => {
        if (item.image_path) {
            setImageExist(true)
        } else {
            setImageExist(false)
        }
    }, [item])

    const onImageFailedToLoad = () => {
        setImageExist(false)
    }

    const redirectToSite = (url) => {
        if (!/^https?:\/\//i.test(url)) {
            url = 'http://' + url
        }

        window.open(url, '_blank')
    }

    const title = (item) => {
        let color = '#0e0eb7'
        let display_time = dayjs.utc(item.selected_date).format('HH:mm')
        let display_icon = false
        if (item.status === constants.status.arrived) {
            color = '#27c31e'
            display_icon = (<AssignmentTurnedInIcon />)
        } 
        if (item.status === constants.status.cancelled) {
            color = '#af8d90'
            display_icon = (<CancelIcon />)
            display_time = '--:--'
        }

        return (
            <div style={{
                fontSize: '28px',
                fontWeight: '500',
                color: color,
            }}>
                {display_icon} {display_time}
            </div>
        )
    }

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    {title(item)}
                </Grid>
                <Grid item xs={6}>
                    {(!isToday || (isToday && !item.status)) && (
                        <div style={{
                            float: 'right',
                        }}>
                            <EditIcon sx={{ color: '#88b7ff' }} onClick={() => onEditClick(item)} />
                            <DeleteIcon sx={{ color: '#ff8888' }} onClick={() => onDeleteClick(item)} />
                        </div>
                    )}
                </Grid>
                <Grid item xs={12}>
                    {/* for bottom border */}
                    <div
                        style={{
                            height: '2px',
                            display: 'block',
                            background: 'linear-gradient(to right, rgba(147,147,147,1) 0%,rgba(147,147,147,1) 30%,rgba(0,0,0,0) 70%, rgba(0,0,0,0) 100%)',
                            marginBottom: '5px',
                        }}
                    />
                </Grid>
                <Grid item xs={5} fullWidth>
                    {imageExist ? (
                        <RoundImage
                            width={'90%'}
                            src={item.image_path}
                            onError={onImageFailedToLoad}
                        />
                    ) : (
                        <div
                            style={{
                                height: '100px',
                                width: '90%',
                                backgroundColor: 'red',
                            }}
                        ></div>
                    )}
                </Grid>
                <Grid item xs={7} fullWidth>
                    <div
                        style={{
                            fontSize: '18px',
                            color: 'black',
                            fontWeight: 'bold',
                        }}
                    >
                        {item.label}
                    </div>
                    <div
                        style={{
                            fontSize: '13px',
                            color: '#455295',
                        }}
                    >
                    {item.description}
                    </div>
                </Grid>
                {item.movie && (
                    <>
                        <Grid item xs={12} fullWidth>
                            <div
                                style={{
                                    fontSize: '15px',
                                    color: 'black',
                                    fontWeight: '500',
                                }}
                            >
                                Movie: {item.movie.label}
                            </div>
                        </Grid>
                        {item.movie.release_date && (
                            <Grid item xs={12} fullWidth>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        color: '#455295',
                                    }}
                                >
                                    Release date: {item.movie.release_date}
                                </div>
                            </Grid>
                        )}
                    </>
                )}
                {item.marker && (
                    <>
                        <Grid item xs={12} fullWidth>
                            <div
                                style={{
                                    fontSize: '15px',
                                    color: 'black',
                                    fontWeight: '500',
                                }}
                            >
                                {item.marker.label}
                            </div>
                        </Grid>
                        {item.marker.address && (
                            <Grid item xs={12} fullWidth>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#455295',
                                }}>
                                    {item.marker.address}
                                    <IconButton
                                            onClick={() => { 
                                                navigator.clipboard.writeText(item.marker.address)
                                                triggerCopyMessage()
                                            }}
                                        >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </div>
                                
                            </Grid>
                        )}
                        {item.marker.link && (
                            <Grid item xs={12} fullWidth>
                                <a 
                                    style={{
                                        fontSize: '14px',
                                        color: '#779bca',
                                    }}
                                    onClick={() => redirectToSite(item.marker.link)}
                                >
                                    {item.marker.link}
                                </a>
                            </Grid>
                        )}
                        {item.marker && item.marker.restaurant && (
                            <Grid item xs={12} fullWidth>
                                <RestaurantCard 
                                    restaurant={item.marker.restaurant}
                                />
                            </Grid>
                        )}
                    </>
                )}
                
            </Grid>
        </>
    )
}

function ScheduleView({
    open,
    handleClose,
    schedules,
    selected_date,
    openArriveForm,
    openEditForm,
    dispatch,
}) {
    const [ removeScheduleGQL, { data: removeData, loading: removeLoading, error: removeError } ] = useMutation(graphql.schedules.remove, { errorPolicy: 'all' })

    const [ deletingId, setDeleting ] = useState(-1)

    // if request failed
    const [ failedAlert, fail ] = useBoop(3000)
    const [ failMessage, setFailMessage ] = useState('')

    const todayString = dayjs().format('YYYY-MM-DD')

    const sortedList = useMemo(() => {
        if (!schedules) return []
        if (schedules.length === 0) return []

        const sorted = schedules.sort((a, b) => {
            if (dayjs(a.selected_date).isAfter(dayjs(b.selected_date))) {
                return 1
            }
            return -1
        })

        return sorted
    }, [schedules])

    useEffect(() => {
        if (removeData) {
            if (deletingId !== -1) {
                dispatch(actions.updateMarkerStatus(removeData.removeSchedule))
                dispatch(actions.removeSchedule(deletingId))
                handleClose()
            }
        }

        if (removeError) {
            setFailMessage(removeError.message)
            fail()
        }
    }, [removeData, removeError, deletingId])

    const isToday = useMemo(() => {
        return todayString === selected_date
    })

    const [ copyMessage, triggerCopyMessage ] = useBoop(3000)

    const onEditClickHandler = (schedule) => {
        openEditForm(schedule)
    }

    const onDeleteClickHandler = (schedule) => {
        if (!window.confirm(`Do you want to remove ${schedule.label}`)) return
        setDeleting(schedule.id)
        removeScheduleGQL({ variables: { id: schedule.id } })
    }

    return (
        <>
            <Dialog
                fullWidth
                maxWidth={'lg'}
                open={open}
                onClose={handleClose}
                scroll={'paper'}
                TransitionComponent={TransitionUp}
            >
                { sortedList && (
                    <>
                        <DialogTitle>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={12} lg={12} fullWidth>
                                    {isToday ? 'Today\'s schdedule' : selected_date}
                                </Grid>
                            </Grid>
                        </DialogTitle>
                        <DialogContent dividiers>
                            <Grid container spacing={2}>
                                {sortedList.map((schedule, index) => (
                                    <Grid item xs={12} key={index} fullWidth>
                                        <ScheduleItem 
                                            item={schedule}
                                            triggerCopyMessage={triggerCopyMessage}
                                            isToday={isToday}
                                            onEditClick={onEditClickHandler}
                                            onDeleteClick={onDeleteClickHandler}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </DialogContent>
                    </>
                )}
                {isToday && (
                    <DialogActions>
                        <Button onClick={openArriveForm}>Arrived</Button>
                    </DialogActions>
                )}
                
            </Dialog>
            <AutoHideAlert 
                open={failedAlert}
                type={'error'}
                message={failMessage}
                timing={3000}
            />
            <AutoHideAlert 
                open={copyMessage}
                type={'success'}
                message={'address copied!'}
                timing={2000}
            />
        </>
    )
}


export default connect(state => ({
    jwt: state.auth.jwt,
}))(ScheduleView)