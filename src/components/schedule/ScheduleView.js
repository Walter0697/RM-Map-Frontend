import React, { useState, useEffect, useMemo, useRef } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Button,
    IconButton,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Popover,
    Slide,
} from '@mui/material'
import backend from '../../constant/backend'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import CancelIcon from '@mui/icons-material/Cancel'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt'
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'

import useBoop from '../../hooks/useBoop'

import AutoHideAlert from '../AutoHideAlert'
import RestaurantCard from '../card/RestaurantCard'

import constants from '../../constant'
import actions from '../../store/actions'
import graphql from '../../graphql'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

const formatMinutesCompact = (minutes) => {
    const absoluteMinutes = Math.abs(minutes)
    if (absoluteMinutes < 60) {
        return `${absoluteMinutes}m`
    }

    const hours = Math.floor(absoluteMinutes / 60)
    const remainMinutes = absoluteMinutes % 60
    if (remainMinutes === 0) {
        return `${hours}h`
    }
    return `${hours}h ${remainMinutes}m`
}

const getDifficultyVisual = (transition) => {
    if (!transition || transition.status === 'unavailable') {
        return {
            color: '#8a97a8',
            icon: SentimentNeutralIcon,
            title: 'Travel unavailable',
        }
    }

    if (transition.difficulty === 'easy') {
        return {
            color: '#2e7d32',
            icon: SentimentSatisfiedAltIcon,
            title: 'Easy',
        }
    }
    if (transition.difficulty === 'difficult') {
        return {
            color: '#c62828',
            icon: SentimentVeryDissatisfiedIcon,
            title: 'Difficult',
        }
    }
    return {
        color: '#ef6c00',
        icon: SentimentNeutralIcon,
        title: 'Moderate',
    }
}

const formatSignedSeconds = (seconds) => {
    const minutes = Math.round(Math.abs(seconds) / 60)
    const formatted = formatMinutesCompact(minutes)
    return `${seconds >= 0 ? '+' : '-'}${formatted}`
}

const toNumberOrFallback = (...values) => {
    for (let i = 0; i < values.length; i++) {
        const value = values[i]
        if (value === undefined || value === null || value === '') continue
        const parsed = Number(value)
        if (!Number.isNaN(parsed)) return parsed
    }
    return 0
}

const toScheduleImageSrc = (item) => {
    const rawPath = item?.image_path || item?.movie?.image_path || item?.marker?.image_link || ''
    if (!rawPath) return ''
    if (/^(https?:)?\/\//i.test(rawPath)) return rawPath

    const base = (backend.IMAGE_LINK || '').replace(/\/+$/, '')
    const normalized = `${rawPath}`
    const imageBaseWithSlash = `${base}/`
    if (normalized.startsWith(imageBaseWithSlash)) {
        return normalized
    }

    if (normalized.startsWith('/image/')) {
        const baseRoot = base.endsWith('/image') ? base.slice(0, -6) : ''
        return `${baseRoot}${normalized}`
    }

    if (normalized.startsWith('/')) {
        return `${base}${normalized}`
    }

    return `${base}/${normalized}`
}

function ScheduleItem({
    item,
    transition,
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
    const [ explanationAnchor, setExplanationAnchor ] = useState(null)

    const imageSrc = toScheduleImageSrc(item)

    useEffect(() => {
        if (imageSrc) {
            setImageExist(true)
        } else {
            setImageExist(false)
        }
    }, [imageSrc])

    const onImageFailedToLoad = () => {
        setImageExist(false)
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
                fontSize: '30px',
                fontWeight: '500',
                color: color,
                lineHeight: 1,
            }}>
                {display_icon} {display_time}
            </div>
        )
    }

    const transitionVisual = getDifficultyVisual(transition)
    const FaceIcon = transitionVisual.icon
    const transitionTravelSeconds = toNumberOrFallback(
        transition?.duration_seconds,
        transition?.travel_duration_seconds,
        transition?.travel_time_seconds,
        transition?.duration,
    )
    const transitionGapSeconds = toNumberOrFallback(
        transition?.scheduled_gap_seconds,
        transition?.between_time_seconds,
        transition?.gap_seconds,
        transition?.scheduled_gap,
    )
    const lineHeight = 70
    const descriptionText = item?.description || item?.marker?.description || ''

    const explanationText = (() => {
        if (!transition || transition.status === 'unavailable') {
            return 'Travel estimate is unavailable for this pair.'
        }
        const travelText = formatMinutesCompact(Math.round(transitionTravelSeconds / 60))
        const gapText = formatMinutesCompact(Math.round(transitionGapSeconds / 60))
        const deltaSeconds = toNumberOrFallback(
            transition?.delta_seconds,
            transition?.buffer_seconds,
            transition?.difference_seconds,
        )
        const deltaText = transition.delta_seconds === undefined
            && transition.buffer_seconds === undefined
            && transition.difference_seconds === undefined
            ? 'N/A'
            : formatSignedSeconds(deltaSeconds)
        return `Gap: ${gapText}, Travel: ${travelText}, Buffer: ${deltaText}.`
    })()

    return (
        <div style={{ width: '100%' }}>
            <div
                style={{
                    width: '100%',
                    borderRadius: '12px',
                    border: '1px solid #d8e0ea',
                    backgroundColor: '#fff',
                    padding: '14px 14px 12px',
                }}
            >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <div>{title(item)}</div>
                {(!isToday || (isToday && !item.status)) && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: '2px',
                        }}
                    >
                        <IconButton size='small' onClick={() => onEditClick(item)}>
                            <EditIcon sx={{ color: '#88b7ff' }} />
                        </IconButton>
                        <IconButton size='small' onClick={() => onDeleteClick(item)}>
                            <DeleteIcon sx={{ color: '#ff8888' }} />
                        </IconButton>
                    </div>
                )}
            </div>

            <div
                style={{
                    height: '2px',
                    display: 'block',
                    background: 'linear-gradient(to right, rgba(154,170,186,1) 0%, rgba(154,170,186,1) 45%, rgba(154,170,186,0) 100%)',
                    marginTop: '10px',
                    marginBottom: '12px',
                    width: '100%',
                }}
            />

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    width: '100%',
                    alignItems: 'stretch',
                }}
            >
                <div style={{ width: '118px', minWidth: '118px' }}>
                    {imageExist ? (
                        <img
                            style={{
                                width: '118px',
                                height: '100%',
                                minHeight: '106px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                display: 'block',
                            }}
                            src={imageSrc}
                            onError={onImageFailedToLoad}
                        />
                    ) : (
                        <div
                            style={{
                                height: '100%',
                                minHeight: '106px',
                                width: '118px',
                                backgroundColor: '#a3bdd8',
                                borderRadius: '6px',
                            }}
                        />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: '17px',
                            color: 'black',
                            fontWeight: 'bold',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {item.label}
                    </div>
                    {descriptionText && (
                        <div
                            style={{
                                marginTop: '4px',
                                fontSize: '13px',
                                color: '#455295',
                                overflowWrap: 'anywhere',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {descriptionText}
                        </div>
                    )}
                    {item.marker && item.marker.address && (
                        <div
                            style={{
                                marginTop: '6px',
                                fontSize: '13px',
                                color: '#455295',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                overflowWrap: 'anywhere',
                            }}
                        >
                            <span style={{ flex: 1 }}>{item.marker.address}</span>
                            <IconButton
                                size='small'
                                onClick={() => {
                                    if (navigator?.clipboard?.writeText) {
                                        navigator.clipboard.writeText(item.marker.address)
                                    }
                                    triggerCopyMessage()
                                }}
                            >
                                <ContentCopyIcon fontSize='small' />
                            </IconButton>
                        </div>
                    )}
                </div>
            </div>

            {item.marker && item.marker.restaurant && (
                <div style={{ marginTop: '10px' }}>
                    <RestaurantCard
                        restaurant={item.marker.restaurant}
                    />
                </div>
            )}
            {item.marker && !item.marker.restaurant && item.marker.link && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#6c7787' }}>
                    Website integration unavailable for this marker.
                </div>
            )}
            {item.movie && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#455295' }}>
                    Movie: {item.movie.label}
                </div>
            )}
            </div>
            {transition && (
                <div style={{ marginTop: '14px' }}>
                    <div style={{ marginTop: '8px', marginBottom: '4px' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '18px',
                                    marginLeft: '8px',
                                    marginRight: '8px',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '94px' }}>
                                    <div style={{ fontSize: '11px', color: '#5f6f83', textAlign: 'center', lineHeight: 1.2 }}>
                                        <div>Schedule</div>
                                        <div>between</div>
                                        <div>time</div>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#2f4056' }}>
                                        {formatMinutesCompact(Math.round(transitionGapSeconds / 60))}
                                    </div>
                                    <div style={{ width: '3px', height: `${lineHeight}px`, backgroundColor: transitionVisual.color, borderRadius: '2px' }} />
                                    <ArrowDownwardIcon sx={{ color: transitionVisual.color, fontSize: '18px' }} />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: '44px',
                                        gap: '6px',
                                    }}
                                >
                                    <IconButton
                                        size='small'
                                        onClick={(event) => setExplanationAnchor(event.currentTarget)}
                                        sx={{ color: transitionVisual.color }}
                                    >
                                        <FaceIcon fontSize='medium' />
                                    </IconButton>
                                    <DirectionsWalkIcon sx={{ color: transitionVisual.color, fontSize: '24px' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '94px' }}>
                                    <div style={{ fontSize: '11px', color: '#5f6f83', textAlign: 'center', lineHeight: 1.2 }}>
                                        <div>Estimated</div>
                                        <div>travel</div>
                                        <div>time</div>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#2f4056' }}>
                                        {formatMinutesCompact(Math.round(transitionTravelSeconds / 60))}
                                    </div>
                                    <div style={{ width: '3px', height: `${lineHeight}px`, backgroundColor: transitionVisual.color, borderRadius: '2px' }} />
                                    <ArrowDownwardIcon sx={{ color: transitionVisual.color, fontSize: '18px' }} />
                                </div>
                            </div>
                            <Popover
                                open={!!explanationAnchor}
                                anchorEl={explanationAnchor}
                                onClose={() => setExplanationAnchor(null)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                            >
                                <div style={{ padding: '10px 12px', maxWidth: '280px', fontSize: '13px', color: '#344861' }}>
                                    {explanationText}
                                </div>
                            </Popover>
                    </div>
                </div>
            )}
        </div>
    )
}

function ScheduleView({
    open,
    handleClose,
    schedules,
    selected_date,
    activeScheduleId,
    fetchStatus,
    fetchError,
    onRetry,
    onRefresh,
    openArriveForm,
    openEditForm,
    jwt,
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

        const sorted = [...schedules].sort((a, b) => {
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
    const [ transitionAnalysis, setTransitionAnalysis ] = useState([])
    const [ transitionFetchStatus, setTransitionFetchStatus ] = useState('idle')
    const [ transitionFetchMessage, setTransitionFetchMessage ] = useState('')
    const transitionRequestVersionRef = useRef(0)

    const onEditClickHandler = (schedule) => {
        openEditForm(schedule)
    }

    const onDeleteClickHandler = (schedule) => {
        if (!window.confirm(`Do you want to remove ${schedule.label}`)) return
        setDeleting(schedule.id)
        removeScheduleGQL({ variables: { id: schedule.id } })
    }

    useEffect(() => {
        const fetchTransitionAnalysis = async () => {
            if (!open || !jwt || !sortedList || sortedList.length <= 1) {
                setTransitionAnalysis([])
                setTransitionFetchStatus('idle')
                setTransitionFetchMessage('')
                return
            }

            const requestVersion = transitionRequestVersionRef.current + 1
            transitionRequestVersionRef.current = requestVersion
            setTransitionFetchStatus('loading')
            setTransitionFetchMessage('')

            const requestSchedules = sortedList.map((schedule) => ({
                schedule_id: schedule.id,
                marker_id: schedule.marker?.id || null,
                label: schedule.label,
                lat: schedule.marker?.latitude,
                lon: schedule.marker?.longitude,
                selected_date: schedule.selected_date,
            }))

            try {
                const response = await fetch(backend.withBasePath('schedules/travel-analysis'), {
                    method: 'POST',
                    headers: {
                        Authorization: jwt,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        schedules: requestSchedules,
                    }),
                })
                if (!response.ok) {
                    if (transitionRequestVersionRef.current !== requestVersion) return
                    setTransitionAnalysis([])
                    setTransitionFetchStatus('error')
                    setTransitionFetchMessage(`Travel analysis endpoint returned ${response.status}`)
                    return
                }
                const payload = await response.json()
                if (transitionRequestVersionRef.current !== requestVersion) return
                setTransitionAnalysis(payload?.transition_analysis || [])
                setTransitionFetchStatus('success')
                setTransitionFetchMessage('')
            } catch (error) {
                if (transitionRequestVersionRef.current !== requestVersion) return
                setTransitionAnalysis([])
                setTransitionFetchStatus('error')
                setTransitionFetchMessage('Travel analysis request failed before reaching provider')
            }
        }

        fetchTransitionAnalysis()
    }, [open, jwt, sortedList, activeScheduleId, fetchStatus])

    const normalizedViewStatus = useMemo(() => {
        if (fetchStatus === 'loading' || fetchStatus === 'error') return fetchStatus
        if (!sortedList || sortedList.length === 0) return 'empty'
        return 'success'
    }, [fetchStatus, sortedList])

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
                            {normalizedViewStatus === 'loading'
                                ? 'Loading schedule...'
                                : (isToday ? 'Today\'s schedule' : (selected_date || 'Schedule details'))}
                        </DialogTitle>
                        <DialogContent dividers>
                            {normalizedViewStatus === 'loading' && (
                                <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    Loading schedule details...
                                </div>
                            )}
                            {normalizedViewStatus === 'error' && (
                                <div style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                                    <div>{fetchError || 'Failed to load schedule details.'}</div>
                                    <Button variant='outlined' onClick={onRetry}>Retry</Button>
                                </div>
                            )}
                            {normalizedViewStatus === 'empty' && (
                                <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    No schedule details available.
                                </div>
                            )}
                            {normalizedViewStatus === 'success' && (
                                <>
                                    {transitionFetchStatus === 'error' && (
                                        <div style={{ marginBottom: '10px', color: '#b33434', fontSize: '13px' }}>
                                            {transitionFetchMessage || 'Travel estimates are temporarily unavailable. Tap Refresh to retry.'}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                                        {sortedList.map((schedule, index) => (
                                            <ScheduleItem
                                                key={index}
                                                item={schedule}
                                                transition={transitionAnalysis[index] || null}
                                                triggerCopyMessage={triggerCopyMessage}
                                                isToday={isToday}
                                                onEditClick={onEditClickHandler}
                                                onDeleteClick={onDeleteClickHandler}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </>
                )}
                {(normalizedViewStatus === 'success' || normalizedViewStatus === 'error') && (
                    <DialogActions>
                        <Button onClick={onRefresh}>Refresh</Button>
                        {isToday && normalizedViewStatus === 'success' && (
                            <Button onClick={openArriveForm}>Arrived</Button>
                        )}
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
