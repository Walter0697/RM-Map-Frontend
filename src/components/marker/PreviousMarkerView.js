import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery, useMutation } from '@apollo/client'
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
import backend from '../../constant/backend'

import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

import dayjs from 'dayjs'

import useBoop from '../../hooks/useBoop'

import ImageHeadText from '../wrapper/ImageHeadText'
import AutoHideAlert from '../AutoHideAlert'
import MarkerDescription from './MarkerDescription'

import generic from '../../scripts/generic'
import actions from '../../store/actions'
import graphql from '../../graphql'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function PreviousMarkerView({
    open,
    handleClose,
    marker,
    onUpdated,
    openSchedule,
    eventtypes,
    dispatch,
}) {
    // graphql request
    const [ listMarkerScheduleGQL, { data: listData, loading: listLoading, error: listError } ] = useLazyQuery(graphql.schedules.by_marker, { fetchPolicy: 'no-cache' })
    const [ revokeMarkerGQL, { data: revokeData, loading: revokeLoading, error: revokeError } ] = useMutation(graphql.markers.revoke, { errorPolicy: 'all' }) 

    const [ typeIcon, setIcon ] = useState(null)
    const [ scheduleList, setSchedules ] = useState([])

    // if request failed
    const [ failedAlert, fail ] = useBoop(3000)
    const [ failMessage, setFailMessage ] = useState('')

    const [ copyMessage, triggerCopyMessage ] = useBoop(3000)

    useEffect(() => {
        if (!marker) return

        const currentType = eventtypes.find(s => s.value === marker.type)
        setIcon(backend.IMAGE_LINK + currentType.icon_path)

        listMarkerScheduleGQL({ variables: { id: marker.id } })
    }, [marker])

    useEffect(() => {
        if (listData) {
            setSchedules(listData.markerschedules)
        }

        if (listError) {
            setFailMessage(listError.message)
            fail()
        }
    }, [listData, listError])

    useEffect(() => {
        if (revokeData) {
            // making dispatch for updating marker
            // then remove it from marker list, or just update the marker list
            dispatch(actions.revokeMarker(revokeData.revokeMarker))
            onUpdated && onUpdated(revokeData.revokeMarker)
        }

        if (revokeError) {
            setFailMessage(revokeError.message)
            fail()
        }
    }, [revokeData, revokeError])

    const onRevokeClick = () => {
        if (!window.confirm(`Do you want to revoke ${marker.label}`)) return
        revokeMarkerGQL({ variables: { id: marker.id } })
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
                { marker && (
                    <>
                        <DialogTitle>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={12} lg={12}
                                    style={{
                                        width: '100%',
                                        overflowX: 'auto',
                                    }}
                                >
                                    <ImageHeadText
                                        iconPath={typeIcon}
                                        iconSize='35px'
                                        label={marker.label}
                                        labelSize='25px'
                                        labelColor='black'
                                    />
                                </Grid>
                            </Grid>
                        </DialogTitle>
                        <DialogContent dividers>
                            <DialogContentText>
                                <Grid container spacing={2}>
                                    { marker.image_link && (
                                        <Grid item xs={12} md={12} lg={12}>
                                            <div
                                                style={{
                                                    marginTop: '6px',
                                                    color: '#4f6474',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Saved marker image
                                            </div>
                                            <img
                                                width='100%'
                                                style={{
                                                    maxHeight: '240px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    marginTop: '8px',
                                                }}
                                                src={backend.IMAGE_LINK + marker.image_link}
                                                alt={`${marker.label} saved marker`}
                                            />
                                        </Grid>
                                    )}
                                    <Grid item xs={12} md={12} lg={12}>
                                        { marker.address } 
                                        <IconButton
                                            onClick={() => { 
                                                navigator.clipboard.writeText(marker.address)
                                                triggerCopyMessage()
                                            }}
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={12}>
                                        <MarkerDescription 
                                            description={marker.description}
                                            onHashTagClick={handleClose}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={12}>
                                        History:
                                    </Grid>
                                    {scheduleList.map((item, index) => (
                                        <Grid 
                                            item 
                                            xs={12} md={12} lg={12}
                                            key={'sl'+index}
                                            style={{
                                                fontStyle: 'italic',
                                                fontSize: 'small',
                                            }}>
                                            {item.label} at {dayjs(item.selected_date).format('YYYY-MM-DD')}
                                        </Grid>
                                    ))}
                                    <Grid item xs={12} md={12} lg={12}>
                                        <Button
                                            variant='contained'
                                            size='middle'
                                            style={{
                                                marginLeft: '10%',
                                                width: '80%',
                                                boxShadow: '2px 2px 6px',
                                                marginBottom: '10px',
                                            }}
                                            startIcon={<CalendarTodayIcon />}
                                            onClick={() => openSchedule && openSchedule()}
                                        >Schedule this marker</Button>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={12}>
                                        <Button 
                                            variant='contained'
                                            size='middle'
                                            style={{
                                                backgroundColor: 'red',
                                                color: 'white',
                                                marginLeft: '10%',
                                                width: '80%',
                                                boxShadow: '2px 2px 6px'
                                            }}
                                            onClick={onRevokeClick}
                                        >Revoke</Button>
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={12}>
                                        {marker.history_preview?.state === 'ready' && marker.history_preview?.image_src ? (
                                            <img
                                                width='100%'
                                                style={{
                                                    maxHeight: '220px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    marginBottom: '8px',
                                                }}
                                                src={marker.history_preview.image_src}
                                                alt={`${marker.label} history preview`}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '100%',
                                                    minHeight: '180px',
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #e0ecf4 0%, #f8fbfd 100%)',
                                                    border: '1px solid #d7e2ea',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#577084',
                                                    marginBottom: '8px',
                                                    textAlign: 'center',
                                                    padding: '12px',
                                                }}
                                            >
                                                {marker.history_preview?.fallback_reason === 'no_coordinates' ? 'No saved coordinates for preview.' : 'Static map preview unavailable.'}
                                            </div>
                                        )}
                                    </Grid>
                                </Grid>
                            </DialogContentText>
                        </DialogContent>
                    </>
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
    eventtypes: state.marker.eventtypes,
}))(PreviousMarkerView)
