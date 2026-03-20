import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material'

import TopBar from '../components/topbar/TopBar'
import BottomUpTrail from '../components/animatein/BottomUpTrail'
import WrapperBox from '../components/wrapper/WrapperBox'
import backend from '../constant/backend'

function formatPlanPeriod(startDate, endDate) {
    if (!startDate && !endDate) {
        return 'No travel dates yet'
    }
    if (startDate && endDate) {
        return startDate === endDate ? startDate : `${startDate} – ${endDate}`
    }
    if (startDate) {
        return `Starts ${startDate}`
    }
    if (endDate) {
        return `Ends ${endDate}`
    }
    return ''
}

function TravelPlanPage({
    jwt,
}) {
    const history = useHistory()
    const [ travelPlans, setTravelPlans ] = useState([])
    const [ travelPlansLoading, setTravelPlansLoading ] = useState(false)
    const [ travelPlansError, setTravelPlansError ] = useState('')
    const [ isPlanDetailOpen, setPlanDetailOpen ] = useState(false)
    const [ planDetail, setPlanDetail ] = useState(null)
    const [ planDetailLoading, setPlanDetailLoading ] = useState(false)
    const [ planDetailError, setPlanDetailError ] = useState('')

    useEffect(() => {
        const fetchTravelPlans = async () => {
            if (!jwt) {
                setTravelPlans([])
                setTravelPlansError('')
                setTravelPlansLoading(false)
                return
            }
            setTravelPlansLoading(true)
            setTravelPlansError('')
            try {
                const response = await fetch(backend.withBasePath('travel-plans?limit=20'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!response.ok) {
                    throw new Error('failed to fetch travel plans')
                }
                const payload = await response.json()
                setTravelPlans(Array.isArray(payload?.items) ? payload.items : [])
            } catch (error) {
                setTravelPlansError('Unable to load saved travel plans')
            } finally {
                setTravelPlansLoading(false)
            }
        }

        fetchTravelPlans()
    }, [jwt])

    const openPlanDetailDialog = async (planId) => {
        if (!jwt) return
        setPlanDetail(null)
        setPlanDetailError('')
        setPlanDetailLoading(true)
        setPlanDetailOpen(true)
        try {
            const response = await fetch(backend.withBasePath(`travel-plans/${planId}`), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                throw new Error('failed to fetch plan detail')
            }
            const payload = await response.json()
            setPlanDetail(payload)
        } catch (error) {
            setPlanDetailError('Unable to load plan details')
        } finally {
            setPlanDetailLoading(false)
        }
    }

    const closePlanDetailDialog = () => {
        setPlanDetailOpen(false)
        setPlanDetail(null)
        setPlanDetailError('')
        setPlanDetailLoading(false)
    }

    const openSchedulePage = (scheduleId, scheduleDate) => {
        if (!scheduleId) return
        const normalizedDate = `${scheduleDate || ''}`.trim()
        if (normalizedDate) {
            history.replace(`/schedule?schedule-date=${encodeURIComponent(normalizedDate)}`)
            return
        }
        history.replace('/schedule')
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/setting')}
                label='Saved Travel Plans'
            />
            <div
                style={{
                    position: 'absolute',
                    height: '80%',
                    width: '95%',
                    paddingLeft: '5%',
                    paddingTop: '20px',
                    overflow: 'auto',
                }}
            >
                {travelPlansLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '32px' }}>
                        <CircularProgress size={24} />
                    </div>
                ) : travelPlansError ? (
                    <Typography color='error'>{travelPlansError}</Typography>
                ) : travelPlans.length === 0 ? (
                    <Typography variant='body2' color='text.secondary'>
                        You have no saved travel plans yet.
                    </Typography>
                ) : (
                    <BottomUpTrail>
                        {travelPlans.map((plan) => (
                            <WrapperBox
                                key={plan.id}
                                minHeight={'96px'}
                                height={'auto'}
                                marginBottom='12px'
                            >
                                <Button
                                    variant='contained'
                                    size='large'
                                    style={{
                                        backgroundColor: '#48acdb',
                                        borderRadius: '5px',
                                        width: '100%',
                                        boxShadow: '2px 2px 6px',
                                        textTransform: 'none',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px',
                                        gap: '10px',
                                    }}
                                    onClick={() => openPlanDetailDialog(plan.id)}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                                        <div
                                            style={{
                                                color: '#1f2f6f',
                                                fontSize: '18px',
                                                fontWeight: 700,
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {plan.title || 'Untitled plan'}
                                        </div>
                                        <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 0.5 }}>
                                            <Chip label={plan.status || 'draft'} size='small' />
                                            <Typography variant='body2' sx={{ color: '#1f2f6f' }}>
                                                {formatPlanPeriod(plan.start_date, plan.end_date)}
                                            </Typography>
                                        </Stack>
                                    </div>
                                    <span
                                        style={{
                                            border: '1px solid #1f2f6f',
                                            color: '#1f2f6f',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                        }}
                                    >
                                        View details
                                    </span>
                                </Button>
                            </WrapperBox>
                        ))}
                    </BottomUpTrail>
                )}
            </div>
            <Dialog
                fullWidth
                maxWidth='sm'
                open={isPlanDetailOpen}
                onClose={closePlanDetailDialog}
            >
                <DialogTitle>
                    {planDetail?.title || 'Travel Plan'}
                </DialogTitle>
                <DialogContent dividers>
                    {planDetailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : planDetailError ? (
                        <Typography color='error'>{planDetailError}</Typography>
                    ) : planDetail ? (
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            {planDetail.description ? (
                                <Typography variant='body2' color='text.secondary'>
                                    {planDetail.description}
                                </Typography>
                            ) : null}
                            <Stack direction='row' spacing={1} alignItems='center'>
                                <Chip label={planDetail.status || 'draft'} size='small' />
                                <Typography variant='body2' color='text.secondary'>
                                    {formatPlanPeriod(planDetail.start_date, planDetail.end_date)}
                                </Typography>
                            </Stack>
                            {Array.isArray(planDetail.daily_plans) && planDetail.daily_plans.length > 0 ? (
                                <Stack spacing={1}>
                                    {planDetail.daily_plans.map((daily) => (
                                        <Box
                                            key={daily.id || `${daily.day_index}-${daily.local_date || ''}`}
                                            sx={{
                                                border: '1px solid #e1e8f0',
                                                borderRadius: 1,
                                                p: 2,
                                            }}
                                        >
                                            <Typography variant='subtitle2'>
                                                Day {daily.day_index}
                                                {daily.local_date ? ` · ${daily.local_date}` : ''}
                                            </Typography>
                                            <Typography variant='body2' sx={{ mt: 0.5 }}>
                                                {daily.summary}
                                            </Typography>
                                            {daily.details ? (
                                                <Typography variant='body2' color='text.secondary'>
                                                    {daily.details}
                                                </Typography>
                                            ) : null}
                                            {daily.schedule_id ? (
                                                <Button
                                                    size='small'
                                                    variant='text'
                                                    sx={{ mt: 1, px: 0 }}
                                                    onClick={() => openSchedulePage(daily.schedule_id, daily.local_date)}
                                                >
                                                    Open linked schedule
                                                </Button>
                                            ) : null}
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant='body2' color='text.secondary'>
                                    No daily entries added to this plan yet.
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <Typography color='text.secondary'>Select a plan to view details.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePlanDetailDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Base>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
})) (TravelPlanPage)
