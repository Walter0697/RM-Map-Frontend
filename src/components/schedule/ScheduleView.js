import React, { useState, useEffect, useMemo } from 'react'
import {
    Button,
    IconButton,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Slide,
} from '@mui/material'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'

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
    triggerCopyMessage,
}) {
    const imageLink = useMemo(() => {
        
    }, [item])  // if marker has image, use this, if not, use the type image

    const [ imageExist, setImageExist ] = useState(false)

    useEffect(() => {
        if (item?.marker?.image_link) {
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

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: '500',
                        color: '#0e0eb7',
                    }}>
                        {dayjs.utc(item.selected_date).format('HH:mm')}
                    </div>
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
                            src={process.env.REACT_APP_IMAGE_LINK + item?.marker?.image_link}
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
}) {
    const sortedList = useMemo(() => {
        if (!schedules) return []
        if (schedules.length === 0) return []

        const sorted = schedules.sort((a, b) => {
            //selected_date
            if (dayjs(a.selected_date).isAfter(dayjs(b.selected_date))) {
                return 1
            }
            return -1
        })

        console.log(sorted)
        return sorted
    }, [schedules])

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
                                    {selected_date}
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
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </DialogContent>
                    </>
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

export default ScheduleView