import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery } from '@apollo/client'
import dayjs from 'dayjs'

import Base from './Base'

import useBoop from '../hooks/useBoop'

import ScheduleList from '../components/list/ScheduleList'
import ScheduleView from '../components/schedule/ScheduleView' 
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
    dispatch,
}) {
    // selected schedules
    const [ selectedSchedules, setSchedules ] = useState([])
    const [ selectedDate, setSelectedDate ] = useState(null)
    const [ updateAlert, confirmUpdated ] = useBoop(3000)
    const [ deepLinkOpenFailed, setDeepLinkOpenFailed ] = useBoop(3000)

    const [ editingSchedule, setEditing ] = useState(null)
    const [ editAlert, confirmedEdited ] = useBoop(3000)

    // if schedule is selecting for arrived
    const [ arriveFormOpen, setArriveFormOpen ] = useState(false)

    const setScheduleView = (schedules, date) => {
        setSchedules(schedules)
        setSelectedDate(date)
    }

    const closeScheduleView = () => {
        setSelectedDate(null)
        setSchedules([])
    }

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
                }
            })
            const payload = response?.data?.pagedschedules || {}
            return {
                items: payload.items || [],
                nextCursor: payload.next_cursor || null,
            }
        }
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

    React.useEffect(() => {
        if (!pendingDeepLink) return
        if (pendingDeepLink.resourceType !== deepLinkScript.resources.schedule) return

        const scheduleId = deepLinkScript.parsePositiveIntId(pendingDeepLink.id)
        if (!scheduleId) {
            dispatch(actions.clearDeepLinkIntent())
            setDeepLinkOpenFailed()
            return
        }

        const selected = scheduleItems.find(s => s.id === scheduleId)
            || schedules.find(s => s.id === scheduleId)

        if (selected) {
            const selectedDate = dayjs(selected.selected_date).format('YYYY-MM-DD')
            setScheduleView([selected], selectedDate)
            dispatch(actions.clearDeepLinkIntent())
            return
        }

        if (pagedScheduleController.loading || pagedScheduleController.refreshing) {
            return
        }

        if (pagedScheduleController.nextCursor) {
            pagedScheduleController.loadMore()
            return
        }

        dispatch(actions.clearDeepLinkIntent())
        setDeepLinkOpenFailed()
    }, [
        pendingDeepLink,
        scheduleItems,
        schedules,
        pagedScheduleController.loading,
        pagedScheduleController.refreshing,
        pagedScheduleController.nextCursor,
        dispatch,
    ])

    return (
        <Base>
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
                open={!!selectedDate}
                handleClose={closeScheduleView}
                schedules={selectedSchedules}
                selected_date={selectedDate}
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
}))(SchedulePage)
