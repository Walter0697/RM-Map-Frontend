import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
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

import Base from './Base'
import TopBar from '../components/topbar/TopBar'
import BottomUpTrail from '../components/animatein/BottomUpTrail'
import WrapperBox from '../components/wrapper/WrapperBox'
import backend from '../constant/backend'

function formatPlanPeriod(startDate, endDate) {
    if (!startDate && !endDate) return 'No travel dates yet'
    if (startDate && endDate) return startDate === endDate ? startDate : `${startDate} - ${endDate}`
    if (startDate) return `Starts ${startDate}`
    return `Ends ${endDate}`
}

function TravelPlansPage({ jwt }) {
    const history = useHistory()

    const [ plans, setPlans ] = useState([])
    const [ loading, setLoading ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')

    const [ isPlanDetailOpen, setPlanDetailOpen ] = useState(false)
    const [ planDetail, setPlanDetail ] = useState(null)
    const [ planDetailLoading, setPlanDetailLoading ] = useState(false)
    const [ planDetailError, setPlanDetailError ] = useState('')

    const [ deletingPlanId, setDeletingPlanId ] = useState(null)
    const [ deletingItemId, setDeletingItemId ] = useState(null)

    const loadPlans = useCallback(async () => {
        if (!jwt) {
            setPlans([])
            setErrorMessage('')
            return
        }

        setLoading(true)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath('travel-plans?limit=20'), {
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

    const openPlanDetailDialog = useCallback(async (planId) => {
        if (!jwt) return

        setPlanDetailOpen(true)
        setPlanDetailLoading(true)
        setPlanDetailError('')
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
            setPlanDetail(payload)
        } catch (error) {
            setPlanDetailError(error.message || 'Failed to load travel plan detail')
            setPlanDetail(null)
        } finally {
            setPlanDetailLoading(false)
        }
    }, [jwt])

    const closePlanDetailDialog = () => {
        setPlanDetailOpen(false)
        setPlanDetail(null)
        setPlanDetailLoading(false)
        setPlanDetailError('')
    }

    useEffect(() => {
        loadPlans()
    }, [loadPlans])

    const confirmAndDeletePlan = async () => {
        if (!planDetail?.id) return
        if (!window.confirm(`Delete travel plan "${planDetail.title || `#${planDetail.id}`}"?`)) return

        setDeletingPlanId(planDetail.id)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath(`travel-plans/${planDetail.id}`), {
                method: 'DELETE',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to delete travel plan (${response.status})`)
            }
            closePlanDetailDialog()
            await loadPlans()
        } catch (error) {
            setPlanDetailError(error.message || 'Failed to delete travel plan')
        } finally {
            setDeletingPlanId(null)
        }
    }

    const confirmAndDeleteItem = async (itemId) => {
        if (!planDetail?.id || !itemId) return
        if (!window.confirm(`Delete travel plan item #${itemId}?`)) return

        setDeletingItemId(itemId)
        setPlanDetailError('')
        try {
            const response = await fetch(backend.withBasePath(`travel-plans/${planDetail.id}/daily-plans/${itemId}`), {
                method: 'DELETE',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || `Failed to delete travel plan item (${response.status})`)
            }
            await Promise.all([loadPlans(), openPlanDetailDialog(planDetail.id)])
        } catch (error) {
            setPlanDetailError(error.message || 'Failed to delete travel plan item')
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
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '32px' }}>
                        <CircularProgress size={24} />
                    </div>
                ) : errorMessage ? (
                    <Typography color='error'>{errorMessage}</Typography>
                ) : plans.length === 0 ? (
                    <Typography variant='body2' color='text.secondary'>
                        No travel plans yet.
                    </Typography>
                ) : (
                    <BottomUpTrail>
                        {plans.map((plan) => (
                            <WrapperBox key={plan.id} minHeight={'96px'} height={'auto'} marginBottom='12px'>
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
                                            {plan.title || `Plan #${plan.id}`}
                                        </div>
                                        <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 0.5 }}>
                                            <Chip label={plan.status || 'draft'} size='small' />
                                            <Typography variant='body2' sx={{ color: '#1f2f6f' }}>
                                                {formatPlanPeriod(plan.start_date, plan.end_date)}
                                            </Typography>
                                        </Stack>
                                    </div>
                                </Button>
                            </WrapperBox>
                        ))}
                    </BottomUpTrail>
                )}
            </div>

            <Dialog fullWidth maxWidth='sm' open={isPlanDetailOpen} onClose={closePlanDetailDialog}>
                <DialogTitle>{planDetail?.title || 'Travel Plan'}</DialogTitle>
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
                                    {planDetail.daily_plans.map((item) => (
                                        <Box
                                            key={item.id || `${item.day_index}-${item.local_date || ''}`}
                                            sx={{
                                                border: '1px solid #e1e8f0',
                                                borderRadius: 1,
                                                p: 2,
                                            }}
                                        >
                                            <Typography variant='subtitle2'>
                                                Day {item.day_index}
                                                {item.local_date ? ` · ${item.local_date}` : ''}
                                            </Typography>
                                            <Typography variant='body2' sx={{ mt: 0.5 }}>
                                                {item.summary}
                                            </Typography>
                                            {item.details ? (
                                                <Typography variant='body2' color='text.secondary'>
                                                    {item.details}
                                                </Typography>
                                            ) : null}
                                            <Button
                                                size='small'
                                                color='error'
                                                sx={{ mt: 1, px: 0 }}
                                                onClick={() => confirmAndDeleteItem(item.id)}
                                                disabled={deletingItemId === item.id}
                                            >
                                                {deletingItemId === item.id ? 'Deleting...' : 'Delete Item'}
                                            </Button>
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant='body2' color='text.secondary'>No items.</Typography>
                            )}
                        </Box>
                    ) : (
                        <Typography color='text.secondary'>Select a plan to view details.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        color='error'
                        onClick={confirmAndDeletePlan}
                        disabled={!planDetail?.id || deletingPlanId === planDetail?.id || planDetailLoading}
                    >
                        {deletingPlanId === planDetail?.id ? 'Deleting...' : 'Delete Plan'}
                    </Button>
                    <Button onClick={closePlanDetailDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Base>
    )
}

const mapStateToProps = (state) => ({
    jwt: state.auth.jwt,
})

export default connect(mapStateToProps)(TravelPlansPage)
