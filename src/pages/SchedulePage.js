import React, { useCallback, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery } from '@apollo/client'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import dayjs from 'dayjs'

import Base from './Base'

import useBoop from '../hooks/useBoop'

import ScheduleList from '../components/list/ScheduleList'
import ScheduleView from '../components/schedule/ScheduleView'
import ScheduleExportPanel from '../components/schedule/ScheduleExportPanel'
import ScheduleArriveForm from '../components/schedule/ScheduleArriveForm'
import ScheduleEditForm from '../components/form/ScheduleEditForm'
import AutoHideAlert from '../components/AutoHideAlert'
import graphql from '../graphql'
import usePagedDataController from '../hooks/usePagedDataController'
import telemetry from '../scripts/telemetry'
import deepLinkScript from '../scripts/deepLink'
import actions from '../store/actions'

function SchedulePage({
    schedules,
    pendingDeepLink,
    jwt,
    dispatch,
}) {
    const history = useHistory()
    const location = useLocation()
    const deepLinkMatch = useRouteMatch('/schedules/:schedule_id')

    const [ selectedSchedules, setSchedules ] = useState([])
    const [ selectedDate, setSelectedDate ] = useState(null)
    const [ activeScheduleId, setActiveScheduleId ] = useState(null)
    const [ scheduleViewStatus, setScheduleViewStatus ] = useState('idle')
    const [ scheduleViewError, setScheduleViewError ] = useState('')
    const [ updateAlert, confirmUpdated ] = useBoop(3000)
    const [ deepLinkOpenFailed, setDeepLinkOpenFailed ] = useBoop(3000)

    const [ editingSchedule, setEditing ] = useState(null)
    const [ editAlert, confirmedEdited ] = useBoop(3000)

    const [ arriveFormOpen, setArriveFormOpen ] = useState(false)
    const deepLinkRequestVersionRef = useRef(0)

    const [ listPagedScheduleGQL ] = useLazyQuery(graphql.schedules.paged, { fetchPolicy: 'no-cache' })
    const pagedScheduleController = usePagedDataController({
        resource: 'schedules_list',
        queryIdentity: { time: dayjs().format('YYYY-MM-DD') },
        fetchPage: async (cursor) => {
            const response = await listPagedScheduleGQL({
                variables: {
                    time: dayjs().format('YYYY-MM-DD'),
                    limit: 30,
                    cursor: cursor || null,
                },
            })
            const payload = response?.data?.pagedschedules || {}
            return {
                items: payload.items || [],
                nextCursor: payload.next_cursor || null,
            }
        },
    })

    React.useEffect(() => {
        pagedScheduleController.refresh()
        telemetry.debugLog('schedules_list', 'refresh:initial')
    }, [])

    const scheduleItems = pagedScheduleController.items

    React.useEffect(() => {
        telemetry.debugLog('schedules_list', 'items:update', {
            count: scheduleItems.length,
            nextCursor: pagedScheduleController.nextCursor,
            loading: pagedScheduleController.loading,
        })
    }, [scheduleItems.length, pagedScheduleController.nextCursor, pagedScheduleController.loading])

    const routeScheduleId = deepLinkScript.parsePositiveIntId(deepLinkMatch?.params?.schedule_id)

    const toScheduleListContext = useCallback(() => {
        if (location.pathname.startsWith('/schedules/')) {
            history.replace('/schedule')
        }
    }, [history, location.pathname])

    const setScheduleView = useCallback((nextSchedules, date, options = {}) => {
        const safeSchedules = nextSchedules || []
        const primarySchedule = safeSchedules[0] || null
        const nextActiveId = options.activeScheduleId || primarySchedule?.id || null
        const nextDate = date || (primarySchedule ? dayjs(primarySchedule.selected_date).format('YYYY-MM-DD') : null)

        setSchedules(safeSchedules)
        setSelectedDate(nextDate)
        setActiveScheduleId(nextActiveId)
        setScheduleViewError('')
        setScheduleViewStatus(safeSchedules.length > 0 ? 'success' : 'empty')
    }, [])

    const closeScheduleView = useCallback(() => {
        setSelectedDate(null)
        setSchedules([])
        setActiveScheduleId(null)
        setScheduleViewStatus('idle')
        setScheduleViewError('')
        toScheduleListContext()
    }, [toScheduleListContext])

    const onScheduleStatusUpdated = () => {
        setArriveFormOpen(false)
        closeScheduleView()
        confirmUpdated()
    }

    const onEditingSchedule = (schedule) => {
        setEditing(schedule)
    }

    const onScheduleUpdated = () => {
        setEditing(null)
        closeScheduleView()
        confirmedEdited()
    }

    const resolveScheduleById = useCallback(async (scheduleId, options = {}) => {
        if (!scheduleId) {
            dispatch(actions.clearDeepLinkIntent())
            closeScheduleView()
            setDeepLinkOpenFailed()
            return
        }

        const requestVersion = deepLinkRequestVersionRef.current + 1
        deepLinkRequestVersionRef.current = requestVersion

        setActiveScheduleId(scheduleId)
        setSchedules([])
        setSelectedDate(null)
        setScheduleViewError('')
        setScheduleViewStatus('loading')

        const existing = (scheduleItems || []).find(s => s.id === scheduleId)
            || (schedules || []).find(s => s.id === scheduleId)

        if (existing) {
            if (deepLinkRequestVersionRef.current !== requestVersion) return
            setScheduleView([existing], dayjs(existing.selected_date).format('YYYY-MM-DD'), { activeScheduleId: scheduleId })
            dispatch(actions.clearDeepLinkIntent())
            if (options.forceListContext) {
                toScheduleListContext()
            }
            return
        }

        try {
            let cursor = null
            let hasMore = true
            while (hasMore) {
                const response = await listPagedScheduleGQL({
                    variables: {
                        time: dayjs().format('YYYY-MM-DD'),
                        limit: 30,
                        cursor,
                    },
                })

                if (deepLinkRequestVersionRef.current !== requestVersion) return

                const payload = response?.data?.pagedschedules || {}
                const items = payload.items || []
                const found = items.find(item => item.id === scheduleId)

                if (found) {
                    setScheduleView([found], dayjs(found.selected_date).format('YYYY-MM-DD'), { activeScheduleId: scheduleId })
                    dispatch(actions.clearDeepLinkIntent())
                    if (options.forceListContext) {
                        toScheduleListContext()
                    }
                    return
                }

                if (!payload.next_cursor) {
                    dispatch(actions.clearDeepLinkIntent())
                    closeScheduleView()
                    setDeepLinkOpenFailed()
                    if (options.forceListContext) {
                        toScheduleListContext()
                    }
                    return
                }

                cursor = payload.next_cursor
                hasMore = !!cursor
            }
        } catch (error) {
            if (deepLinkRequestVersionRef.current !== requestVersion) return
            setScheduleViewError('Failed to load schedule details. Please retry.')
            setScheduleViewStatus('error')
            if (options.forceListContext) {
                toScheduleListContext()
            }
        }
    }, [
        scheduleItems,
        schedules,
        listPagedScheduleGQL,
        dispatch,
        closeScheduleView,
        setDeepLinkOpenFailed,
        setScheduleView,
        toScheduleListContext,
    ])

    const refreshActiveSchedule = useCallback(() => {
        if (!activeScheduleId) return

        const currentDateKey = selectedDate || (selectedSchedules[0] ? dayjs(selectedSchedules[0].selected_date).format('YYYY-MM-DD') : null)
        const sameDaySchedules = currentDateKey
            ? scheduleItems.filter((item) => dayjs(item.selected_date).format('YYYY-MM-DD') === currentDateKey)
            : []
        if (sameDaySchedules.length > 0) {
            const hasActiveSchedule = sameDaySchedules.some((item) => item.id === activeScheduleId)
            const nextActiveScheduleId = hasActiveSchedule ? activeScheduleId : sameDaySchedules[0].id
            setScheduleView(sameDaySchedules, currentDateKey, { activeScheduleId: nextActiveScheduleId })
            return
        }

        const selected = scheduleItems.find(s => s.id === activeScheduleId)
            || schedules.find(s => s.id === activeScheduleId)
            || selectedSchedules.find(s => s.id === activeScheduleId)
        if (selected) {
            const selectedDay = dayjs(selected.selected_date).format('YYYY-MM-DD')
            const currentViewDay = selectedSchedules.filter((item) => dayjs(item.selected_date).format('YYYY-MM-DD') === selectedDay)
            const nextView = currentViewDay.length > 0 ? currentViewDay : [selected]
            setScheduleView(nextView, selectedDay, { activeScheduleId })
            return
        }
        resolveScheduleById(activeScheduleId, { forceListContext: false })
    }, [activeScheduleId, scheduleItems, schedules, selectedSchedules, selectedDate, resolveScheduleById, setScheduleView])

    const onScheduleRemoved = useCallback((removedScheduleId) => {
        if (!removedScheduleId) return

        const nextSelectedSchedules = (selectedSchedules || []).filter((item) => item.id !== removedScheduleId)
        if (nextSelectedSchedules.length === 0) {
            // Ensure route/view state resets immediately after removing the last visible item.
            closeScheduleView()
            pagedScheduleController.refresh()
            return
        }

        const activeStillExists = nextSelectedSchedules.some((item) => item.id === activeScheduleId)
        const nextActiveScheduleId = activeStillExists ? activeScheduleId : nextSelectedSchedules[0].id
        const nextDate = dayjs(nextSelectedSchedules[0].selected_date).format('YYYY-MM-DD')
        setScheduleView(nextSelectedSchedules, nextDate, { activeScheduleId: nextActiveScheduleId })
        pagedScheduleController.refresh()
    }, [activeScheduleId, closeScheduleView, pagedScheduleController, selectedSchedules, setScheduleView])

    React.useEffect(() => {
        const pendingDeepLinkId = pendingDeepLink?.resourceType === deepLinkScript.resources.schedule
            ? deepLinkScript.parsePositiveIntId(pendingDeepLink.id)
            : null

        const targetScheduleId = routeScheduleId || pendingDeepLinkId
        if (!targetScheduleId) return

        resolveScheduleById(targetScheduleId, { forceListContext: true })
    }, [routeScheduleId, pendingDeepLink, resolveScheduleById])

    const scheduleViewOpen = scheduleViewStatus === 'loading'
        || scheduleViewStatus === 'error'
        || selectedSchedules.length > 0

    return (
        <Base>
            <ScheduleExportPanel jwt={jwt} schedules={scheduleItems} />
            <ScheduleList
                openScheduleView={setScheduleView}
                schedulesOverride={scheduleItems}
                onReachEnd={pagedScheduleController.loadMore}
                onRefreshTop={pagedScheduleController.refresh}
                hasMore={!!pagedScheduleController.nextCursor}
                loadingMore={pagedScheduleController.loading}
                refreshing={pagedScheduleController.refreshing}
                loadingError={pagedScheduleController.error}
                onRetry={pagedScheduleController.retry}
                staleData={pagedScheduleController.stale}
                offlineCached={pagedScheduleController.offlineCached}
            />
            <ScheduleView
                open={scheduleViewOpen}
                handleClose={closeScheduleView}
                schedules={selectedSchedules}
                selected_date={selectedDate}
                activeScheduleId={activeScheduleId}
                fetchStatus={scheduleViewStatus}
                fetchError={scheduleViewError}
                onRetry={refreshActiveSchedule}
                onRefresh={refreshActiveSchedule}
                onScheduleRemoved={onScheduleRemoved}
                openArriveForm={() => setArriveFormOpen(true)}
                openEditForm={onEditingSchedule}
            />
            <ScheduleArriveForm
                open={arriveFormOpen}
                handleClose={() => setArriveFormOpen(false)}
                onUpdated={onScheduleStatusUpdated}
                schedule_list={selectedSchedules}
            />
            <ScheduleEditForm
                open={!!editingSchedule}
                handleClose={() => setEditing(null)}
                onUpdated={onScheduleUpdated}
                schedule={editingSchedule}
            />
            <AutoHideAlert
                open={updateAlert}
                type={'success'}
                message={'Update status!'}
                timing={3000}
            />
            <AutoHideAlert
                open={editAlert}
                type={'success'}
                message={'Successfully edit schedule!'}
                timing={3000}
            />
            <AutoHideAlert
                open={deepLinkOpenFailed}
                type={'error'}
                message={'Requested schedule cannot be opened. Showing schedule list instead.'}
                timing={3000}
            />
        </Base>
    )
}

export default connect(state => ({
    schedules: state.schedule.schedules,
    pendingDeepLink: state.deepLink.pending,
    jwt: state.auth.jwt,
}))(SchedulePage)
