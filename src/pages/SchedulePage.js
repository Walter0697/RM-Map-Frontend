import React, { useState } from 'react'


import Base from './Base'

import useBoop from '../hooks/useBoop'

import ScheduleList from '../components/list/ScheduleList'
import ScheduleView from '../components/schedule/ScheduleView' 
import ScheduleArriveForm from '../components/schedule/ScheduleArriveForm'
import AutoHideAlert from '../components/AutoHideAlert'

function SchedulePage() {
    // selected schedules
    const [ selectedSchedules, setSchedules ] = useState([])
    const [ selectedDate, setSelectedDate ] = useState(null)
    const [ updateAlert, confirmUpdated ] = useBoop(3000)

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

    return (
        <Base>
            <ScheduleList
                openScheduleView={setScheduleView}
            />
            <ScheduleView
                open={!!selectedDate}
                handleClose={closeScheduleView}
                schedules={selectedSchedules}
                selected_date={selectedDate}
                openArriveForm={() => setArriveFormOpen(true)}
            />
            <ScheduleArriveForm 
                open={arriveFormOpen}
                handleClose={() => setArriveFormOpen(false)}
                onUpdated={onScheduleStatusUpdated}
                schedule_list={selectedSchedules}
            />
            <AutoHideAlert 
                open={updateAlert}
                type={'success'}
                message={'Update status!'}
                timing={3000}
            />
        </Base>
    )
}

export default SchedulePage