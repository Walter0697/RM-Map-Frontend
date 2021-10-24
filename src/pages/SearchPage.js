import React, { useState, useCallback } from 'react'
import Base from './Base'

import useBoop from '../hooks/useBoop'

import SearchMap from '../components/map/SearchMap'
import MarkerForm from '../components/form/MarkerForm'
import AutoHideAlert from '../components/AutoHideAlert'

function SearchPage() {
    // create form variable
    const [ isFormOpen, setFormOpen ] = useState(false)
    const [ selectedLocation, setLocation ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)

    const setLocationToCreateForm = (location) => {
        setLocation(location)
        setFormOpen(true)
    }

    const closeForm = () => {
        setLocation(null)
        setFormOpen(false)
    }

    const onMarkerCreated = () => {
        setLocation(null)
        setFormOpen(false)
        confirmCreated()
    }

    const MemoMap = useCallback(<SearchMap
            openForm={setLocationToCreateForm}
        />, [setLocationToCreateForm])

    return (
        <Base>
            {MemoMap}
            <MarkerForm 
                open={isFormOpen}
                handleClose={closeForm}
                location={selectedLocation}
                onCreated={onMarkerCreated}
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

export default SearchPage