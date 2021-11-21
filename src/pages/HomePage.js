import React, { useState } from 'react'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import HomeList from '../components/list/HomeList'
import ScheduleArriveForm from '../components/schedule/ScheduleArriveForm'
import AutoHideAlert from '../components/AutoHideAlert'
import MarkerView from '../components/marker/MarkerView'
import ScheduleForm from '../components/form/ScheduleForm'

function HomePage() {
    // selected schedules
    const [ selectedSchedules, setSchedules ] = useState([])
    const [ updateAlert, confirmUpdated ] = useBoop(3000)

    // if schedule if selecting for arrived
    const [ arriveFormOpen, setArriveFormOpen ] = useState(false)

    // for featured marker
    const [ selectedMarker, setSelected ] = useState(null)
    // if the selected marker is set to be schedule
    const [ scheduleFormOpen, setScheduleFormOpen ] = useState(false)
    const [ createAlert, confirmCreated ] = useBoop(3000)

    const openScheduleStatusForm = () => {
        if (selectedSchedules && selectedSchedules.length !== 0) {
            setArriveFormOpen(true)
        }
    }

    const onYesterdayStatusUpdated = () => {
        setSchedules([])
        setArriveFormOpen(false)
        confirmUpdated()
    }

    const onScheduleCreated = () => {
        setSelected(null)
        setScheduleFormOpen(false)
        confirmCreated()
    }

    return (
        <Base>
            <TopBar
                label='Home'
            />
            <HomeList
                yesterdaySchedules={selectedSchedules}
                setYesterdaySchedules={setSchedules}
                openYesterdayStatusForm={openScheduleStatusForm}
                setSelectedMarker={setSelected}
            />
            {/* for yesterday schedule arrival */}
            <ScheduleArriveForm 
                open={arriveFormOpen}
                handleClose={() => setArriveFormOpen(false)}
                onUpdated={onYesterdayStatusUpdated}
                schedule_list={selectedSchedules}
                setYesterday
            />
            <AutoHideAlert 
                open={updateAlert}
                type={'success'}
                message={'Confirm yesterday schedules status!'}
                timing={3000}
            />
            {/* for featured marker */}
            <MarkerView
                open={!!selectedMarker}
                handleClose={() => setSelected(null)}
                openSchedule={() => setScheduleFormOpen(true)}
                marker={selectedMarker}
            />
            <ScheduleForm
                open={scheduleFormOpen}
                handleClose={() => setScheduleFormOpen(false)}
                onCreated={onScheduleCreated}
                marker={selectedMarker}
            />
            <AutoHideAlert 
                open={createAlert}
                type={'success'}
                message={'Successfully create marker!'}
                timing={3000}
            />
        </Base>
    )
}

export default HomePage