import React, { useState } from 'react'
import Base from './Base'

import ScheduleList from '../components/list/ScheduleList'
import ScheduleView from '../components/schedule/ScheduleView' 

function SchedulePage() {
    // selected schedules
    const [ selectedSchedules, setSchedules ] = useState([])
    const [ selectedDate, setSelectedDate ] = useState(null)

    const setScheduleView = (schedules, date) => {
        setSchedules(schedules)
        setSelectedDate(date)
    }

    const closeScheduleView = () => {
        setSelectedDate(null)
        setSchedules([])
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
            />
        </Base>
    )
}

export default SchedulePage