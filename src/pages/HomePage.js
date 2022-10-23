import React, { useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'

import TopBar from '../components/topbar/TopBar'
import HomeList from '../components/list/HomeList'
import ScheduleArriveForm from '../components/schedule/ScheduleArriveForm'
import AutoHideAlert from '../components/AutoHideAlert'
import CircleIconButton from '../components/field/CircleIconButton'
import MarkerView from '../components/marker/MarkerView'
import ScheduleForm from '../components/form/ScheduleForm'

function HomePage({
    roroadlists,
}) {
    const history = useHistory()

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

    const currentUncheckedList = useMemo(() => {
        if (!roroadlists) return null
        const filtered = roroadlists.filter(s => !s.checked)
        if (filtered.length === 0) return null
        return filtered.length
    }, [roroadlists])

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
            <div
                style={{
                    width: '100%',
                    height: '90%',
                    position: 'relative',
                }}
            >
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
                    message={'Confirm previous schedules status!'}
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
                <div 
                    style={{
                        position: 'absolute',
                        top: '10%',
                        right: '20px',
                    }}
                >
                    <CircleIconButton
                        onClickHandler={() => history.replace('/roroadlist')}
                        badgeNumber={currentUncheckedList}
                    >
                        <PlaylistAddCheckIcon />
                    </CircleIconButton>
                </div>
            </div>
        </Base>
    )
}

export default connect((state) => ({
    roroadlists: state.roroadlist.roroadlists,
})) (HomePage)