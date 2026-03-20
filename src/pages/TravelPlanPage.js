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

    const openSchedulePage = (scheduleId) => {
        if (!scheduleId) return
        history.replace(`/schedules/${scheduleId}`)
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/setting')}
                label='Saved Travel Plans'
            />
            <Box
                sx={{
                    px: 2,
                    py: 2,
                    mt: 2,
                    borderRadius: 2,
                    backgroundColor: '#f7f9fb',
                    border: '1px solid #e1e8f0',
                    mx: 2,
                }}
            >
                {travelPlansLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : travelPlansError ? (
                    <Typography color='error'>{travelPlansError}</Typography>
                ) : travelPlans.length === 0 ? (
                    <Typography variant='body2' color='text.secondary'>
                        You have no saved travel plans yet.
                    </Typography>
                ) : (
                    travelPlans.map((plan) => (
                        <Box
                            key={plan.id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: 2,
                                py: 2,
                                borderBottom: '1px solid #e1e8f0',
                                '&:last-child': {
                                    borderBottom: 'none',
                                },
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography variant='subtitle1'>
                                    {plan.title || 'Untitled plan'}
                                </Typography>
                                <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 0.5 }}>
                                    <Chip label={plan.status || 'draft'} size='small' />
                                    <Typography variant='body2' color='text.secondary'>
                                        {formatPlanPeriod(plan.start_date, plan.end_date)}
                                    </Typography>
                                </Stack>
                            </Box>
                            <Button size='small' variant='outlined' onClick={() => openPlanDetailDialog(plan.id)}>
                                View details
                            </Button>
                        </Box>
                    ))
                )}
            </Box>
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
                                                    onClick={() => openSchedulePage(daily.schedule_id)}
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
