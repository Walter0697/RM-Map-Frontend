import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import HomeTop from '../components/home/HomeTop'
import HomeList from '../components/list/HomeList'
import ScheduleArriveForm from '../components/schedule/ScheduleArriveForm'
import AutoHideAlert from '../components/AutoHideAlert'
import MarkerView from '../components/marker/MarkerView'
import ScheduleForm from '../components/form/ScheduleForm'
import backend from '../constant/backend'
import { fetchPendingSocialMediaAnalysis } from './socialMediaPending'

function HomePage({ jwt }) {
    const history = useHistory()
    const [pendingCount, setPendingCount] = useState(0)
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

    useEffect(() => {
        if (!jwt) return
        fetchPendingSocialMediaAnalysis(fetch, backend.BACKEND_BASE_URL, jwt)
            .then((payload) => setPendingCount(payload.count))
            .catch(() => setPendingCount(0))
    }, [jwt])

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
                <HomeTop pendingCount={pendingCount} onPendingClick={() => history.push('/pending-social-analysis')} />
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
            </div>
        </Base>
    )
}

export default connect((state) => ({ jwt: state.auth.jwt }))(HomePage)
