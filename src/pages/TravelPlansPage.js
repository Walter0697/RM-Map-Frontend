import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from '@mui/material'

import Base from './Base'
import TopBar from '../components/topbar/TopBar'
import backend from '../constant/backend'

function TravelPlansPage({ jwt }) {
    const history = useHistory()

    const [plans, setPlans] = useState([])
    const [planDetails, setPlanDetails] = useState({})
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [deletingPlanId, setDeletingPlanId] = useState(null)
    const [deletingItemId, setDeletingItemId] = useState(null)

    const loadPlans = useCallback(async () => {
        if (!jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath('travel-plans'), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to load travel plans (${response.status})`)
            }
            const payload = await response.json()
            setPlans(Array.isArray(payload?.items) ? payload.items : [])
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load travel plans')
        } finally {
            setLoading(false)
        }
    }, [jwt])

    const loadPlanDetail = useCallback(async (planId) => {
        if (!jwt) return
        try {
            const response = await fetch(backend.withBasePath(`travel-plans/${planId}`), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to load travel plan ${planId}`)
            }
            const payload = await response.json()
            setPlanDetails((prev) => ({
                ...prev,
                [planId]: payload,
            }))
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load travel plan detail')
        }
    }, [jwt])

    useEffect(() => {
        loadPlans()
    }, [loadPlans])

    const confirmAndDeletePlan = async (planId, title) => {
        if (!window.confirm(`Delete travel plan "${title || `#${planId}`}"?`)) return
        setDeletingPlanId(planId)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath(`travel-plans/${planId}`), {
                method: 'DELETE',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to delete travel plan (${response.status})`)
            }
            await loadPlans()
            setPlanDetails((prev) => {
                const next = { ...prev }
                delete next[planId]
                return next
            })
        } catch (error) {
            setErrorMessage(error.message || 'Failed to delete travel plan')
        } finally {
            setDeletingPlanId(null)
        }
    }

    const confirmAndDeleteItem = async (planId, itemId) => {
        if (!window.confirm(`Delete travel plan item #${itemId}?`)) return
        setDeletingItemId(itemId)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath(`travel-plans/${planId}/daily-plans/${itemId}`), {
                method: 'DELETE',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to delete travel plan item (${response.status})`)
            }
            await Promise.all([loadPlans(), loadPlanDetail(planId)])
        } catch (error) {
            setErrorMessage(error.message || 'Failed to delete travel plan item')
        } finally {
            setDeletingItemId(null)
        }
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/setting')}
                label='Travel Plans'
            />
            <Box sx={{ p: 2, pt: 10 }}>
                {loading ? (
                    <Stack direction='row' spacing={1} alignItems='center'>
                        <CircularProgress size={20} />
                        <Typography>Loading travel plans...</Typography>
                    </Stack>
                ) : null}

                {!loading && plans.length === 0 ? (
                    <Typography>No travel plans yet.</Typography>
                ) : null}

                {errorMessage ? (
                    <Typography color='error' sx={{ mb: 2 }}>
                        {errorMessage}
                    </Typography>
                ) : null}

                <Stack spacing={2}>
                    {plans.map((plan) => {
                        const detail = planDetails[plan.id]
                        const dailyPlans = Array.isArray(detail?.daily_plans) ? detail.daily_plans : []

                        return (
                            <Paper key={plan.id} sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Typography variant='h6'>{plan.title || `Plan #${plan.id}`}</Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                        {plan.start_date || 'N/A'} - {plan.end_date || 'N/A'}
                                    </Typography>
                                    <Stack direction='row' spacing={1}>
                                        <Button
                                            size='small'
                                            variant='outlined'
                                            onClick={() => loadPlanDetail(plan.id)}
                                        >
                                            {detail ? 'Refresh Items' : 'Load Items'}
                                        </Button>
                                        <Button
                                            size='small'
                                            color='error'
                                            variant='contained'
                                            disabled={deletingPlanId === plan.id}
                                            onClick={() => confirmAndDeletePlan(plan.id, plan.title)}
                                        >
                                            {deletingPlanId === plan.id ? 'Deleting...' : 'Delete Plan'}
                                        </Button>
                                    </Stack>

                                    {detail ? (
                                        <Stack spacing={1} sx={{ pt: 1 }}>
                                            <Typography variant='subtitle2'>Items</Typography>
                                            {dailyPlans.length === 0 ? (
                                                <Typography variant='body2' color='text.secondary'>No items.</Typography>
                                            ) : dailyPlans.map((item) => (
                                                <Paper key={item.id} variant='outlined' sx={{ p: 1 }}>
                                                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                                        <Box>
                                                            <Typography variant='body2'>
                                                                Day {item.day_index}: {item.summary}
                                                            </Typography>
                                                            {item.local_date ? (
                                                                <Typography variant='caption' color='text.secondary'>
                                                                    {item.local_date}
                                                                </Typography>
                                                            ) : null}
                                                        </Box>
                                                        <Button
                                                            size='small'
                                                            color='error'
                                                            onClick={() => confirmAndDeleteItem(plan.id, item.id)}
                                                            disabled={deletingItemId === item.id}
                                                        >
                                                            {deletingItemId === item.id ? 'Deleting...' : 'Delete Item'}
                                                        </Button>
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    ) : null}
                                </Stack>
                            </Paper>
                        )
                    })}
                </Stack>
            </Box>
        </Base>
    )
}

const mapStateToProps = (state) => ({
    jwt: state.auth.jwt,
})

export default connect(mapStateToProps)(TravelPlansPage)
