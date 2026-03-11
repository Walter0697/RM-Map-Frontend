import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Slide,
    Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import SendIcon from '@mui/icons-material/Send'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline'

import CircleIconButton from '../field/CircleIconButton'
import generate from '../../scripts/generate'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

const getPreviewCardStyle = (phase, direction) => {
    if (phase === 'enter') {
        return {
            opacity: 0.2,
            transform: `translateX(${direction * 18}px)`,
        }
    }

    return {
        opacity: 1,
        transform: 'translateX(0px)',
    }
}

function ScheduleShareView({
    open,
    handleClose,
    schedules,
    scheduleFrom,
    scheduleTo,
    eventtypes,
}) {
    const [ generating, setGenerating ] = useState(false)
    const [ previewItems, setPreviewItems ] = useState([])
    const [ activeIndex, setActiveIndex ] = useState(0)
    const [ touchStartX, setTouchStartX ] = useState(null)
    const [ transitionPhase, setTransitionPhase ] = useState('idle')
    const [ animationDirection, setAnimationDirection ] = useState(1)

    const scheduleTitle = useMemo(() => {
        if (!Array.isArray(schedules) || schedules.length === 0) return 'Schedule Share Preview'
        return `Schedule Share Preview: ${previewItems.length || 1} date${(previewItems.length || 1) > 1 ? 's' : ''}`
    }, [schedules, previewItems.length])

    const activePreview = previewItems[activeIndex] || null

    useEffect(() => {
        if (!activePreview) {
            setTransitionPhase('idle')
            return undefined
        }

        setTransitionPhase('enter')
        const settleTimer = window.setTimeout(() => {
            setTransitionPhase('idle')
        }, 180)

        return () => {
            window.clearTimeout(settleTimer)
        }
    }, [activePreview])

    useEffect(() => {
        let active = true
        const setImages = async () => {
            if (!open || !Array.isArray(schedules) || schedules.length === 0) return
            setGenerating(true)
            try {
                const generated = await generate.schedulePreview.generateSchedulePreviewImagesByDate(schedules, {
                    eventtypes,
                    scheduleFrom,
                    scheduleTo,
                })
                if (active) {
                    setPreviewItems(generated)
                    setActiveIndex(0)
                    setTransitionPhase('idle')
                }
            } finally {
                if (active) {
                    setGenerating(false)
                }
            }
        }

        if (open) {
            setPreviewItems([])
            setActiveIndex(0)
            setImages()
        }

        return () => {
            active = false
        }
    }, [open, schedules, eventtypes, scheduleFrom, scheduleTo])

    const downloadImage = async (item = activePreview) => {
        if (!item?.imageUrl) return
        const anchor = document.createElement('a')
        anchor.href = item.imageUrl
        anchor.download = `schedule-share-${item.dateKey || 'preview'}.png`
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
    }

    const downloadAllImages = async () => {
        for (const item of previewItems) {
            // Stagger downloads so the browser accepts each generated file.
            await downloadImage(item)
            await new Promise((resolve) => window.setTimeout(resolve, 120))
        }
    }

    const shareImage = async () => {
        if (!activePreview?.imageUrl) return
        if (!navigator.share) {
            await downloadImage()
            return
        }

        const blob = await (await fetch(activePreview.imageUrl)).blob()
        const filesArray = [
            new File([blob], `schedule-share-${activePreview.dateKey || 'preview'}.png`, {
                type: blob.type,
                lastModified: new Date().getTime(),
            }),
        ]
        const shareData = {
            files: filesArray,
            text: `Schedule share ${activePreview.title || ''}`.trim(),
        }

        if (!navigator.canShare || navigator.canShare({ files: filesArray })) {
            await navigator.share(shareData)
            return
        }

        await downloadImage()
    }

    const movePreview = (direction) => {
        setAnimationDirection(direction < 0 ? -1 : 1)
        setActiveIndex((current) => {
            if (previewItems.length === 0) return 0
            const nextIndex = current + direction
            if (nextIndex < 0 || nextIndex >= previewItems.length) return current
            return nextIndex
        })
    }

    const onTouchStart = (event) => {
        setTouchStartX(event.changedTouches?.[0]?.clientX ?? null)
    }

    const onTouchEnd = (event) => {
        const endX = event.changedTouches?.[0]?.clientX ?? null
        if (touchStartX === null || endX === null) return
        const delta = endX - touchStartX
        if (Math.abs(delta) < 30) return
        movePreview(delta < 0 ? 1 : -1)
        setTouchStartX(null)
    }

    return (
        <Dialog
            fullWidth
            maxWidth='lg'
            open={open}
            onClose={handleClose}
            scroll='paper'
            TransitionComponent={TransitionUp}
        >
            <DialogTitle>{scheduleTitle}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div
                            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '280px', alignItems: 'center', gap: '12px' }}
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                        >
                            {generating ? (
                                <CircularProgress />
                            ) : activePreview?.imageUrl ? (
                                <>
                                    <Typography variant='subtitle2'>
                                        {activePreview.title} ({activeIndex + 1}/{previewItems.length})
                                    </Typography>
                                    <div
                                        key={activePreview.dateKey}
                                        style={{
                                            width: '100%',
                                            maxWidth: '420px',
                                            transition: 'opacity 160ms ease, transform 160ms ease',
                                            ...getPreviewCardStyle(transitionPhase, animationDirection),
                                        }}
                                    >
                                        {activePreview?.imageUrl ? (
                                            <img
                                                style={{ width: '100%', maxWidth: '420px', borderRadius: '18px', boxShadow: '0 16px 40px rgba(38, 62, 108, 0.18)' }}
                                                src={activePreview.imageUrl}
                                                alt='Schedule share preview'
                                            />
                                        ) : null}
                                    </div>
                                    {previewItems.length > 1 ? (
                                        <Grid container>
                                            <Grid item xs={6} style={{ display: 'flex', justifyContent: 'flex-start', paddingRight: '20px' }}>
                                                <CircleIconButton
                                                    onClickHandler={() => movePreview(-1)}
                                                    disabled={activeIndex === 0}
                                                    ariaLabel='Previous date'
                                                >
                                                    <ArrowBackIosNewIcon />
                                                </CircleIconButton>
                                            </Grid>
                                            <Grid item xs={6} style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '20px' }}>
                                                <CircleIconButton
                                                    onClickHandler={() => movePreview(1)}
                                                    disabled={activeIndex === previewItems.length - 1}
                                                    ariaLabel='Next date'
                                                >
                                                    <ArrowForwardIosIcon />
                                                </CircleIconButton>
                                            </Grid>
                                        </Grid>
                                    ) : null}
                                </>
                            ) : (
                                <Typography color='text.secondary'>No schedule preview available.</Typography>
                            )}
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container alignItems='center'>
                            <Grid item xs={4} style={{ display: 'flex', justifyContent: 'flex-start', paddingRight: '18px' }}>
                                {navigator.share ? (
                                    <CircleIconButton
                                        onClickHandler={shareImage}
                                        disabled={generating || !activePreview?.imageUrl}
                                        ariaLabel='Share schedule image'
                                        background='#f4fbf0'
                                    >
                                        <SendIcon />
                                    </CircleIconButton>
                                ) : null}
                            </Grid>
                            <Grid item xs={4} style={{ display: 'flex', justifyContent: 'center', paddingLeft: '9px', paddingRight: '9px' }}>
                                <CircleIconButton
                                    onClickHandler={downloadAllImages}
                                    disabled={generating || previewItems.length === 0}
                                    ariaLabel='Download all dates'
                                    background='#f4fbf0'
                                >
                                    <DownloadForOfflineIcon />
                                </CircleIconButton>
                            </Grid>
                            <Grid item xs={4} style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '18px' }}>
                                <CircleIconButton
                                    onClickHandler={downloadImage}
                                    disabled={generating || !activePreview?.imageUrl}
                                    ariaLabel='Download schedule image'
                                    background='#f4fbf0'
                                >
                                    <SaveIcon />
                                </CircleIconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}

export default connect((state) => ({
    eventtypes: state.marker.eventtypes,
}))(ScheduleShareView)
