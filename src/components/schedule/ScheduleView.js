import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    Button,
    IconButton,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions,
    Grid,
    Slide,
} from '@mui/material'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CancelIcon from '@mui/icons-material/Cancel'

import useBoop from '../../hooks/useBoop'

import CircleIconButton from '../field/CircleIconButton'
import AutoHideAlert from '../AutoHideAlert'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function ScheduleItem({
    item,
    eventtypes,
    triggerCopyMessage,
}) {
    const imageLink = useMemo(() => {
        if (item?.marker?.image_link) {
            return item.marker.image_link
        }

        if (item?.marker?.type) {
            const typeObj = eventtypes.find(s => s.value === item.marker.type)
            if (typeObj) {
                return typeObj.icon_path
            }
        }
        
        return ''
    }, [item])  // if marker has image, use this, if not, use the type image

    const [ imageExist, setImageExist ] = useState(false)

    useEffect(() => {
        if (imageLink) {
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
        if (item.status === 'arrived') {
            color = '#27c31e'
            display_icon = (<AssignmentTurnedInIcon />)
        } 
        if (item.status === 'cancelled') {
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
                <Grid item xs={12}>
                    {title(item)}
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
                        <img 
                            width='90%'
                            src={process.env.REACT_APP_IMAGE_LINK + imageLink}
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
    eventtypes,
}) {
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

    const isToday = useMemo(() => {
        return todayString === selected_date
    })

    const [ copyMessage, triggerCopyMessage ] = useBoop(3000)

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
                                            eventtypes={eventtypes}
                                            triggerCopyMessage={triggerCopyMessage}
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
                open={copyMessage}
                type={'success'}
                message={'address copied!'}
                timing={2000}
            />
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
})) (ScheduleView)