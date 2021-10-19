import React, { useState, useCallback } from 'react'
import Base from './Base'

import SearchMap from '../components/map/SearchMap'
import MarkerForm from '../components/form/MarkerForm'

function SearchPage() {
    const [ isFormOpen, setFormOpen ] = useState(false)
    const [ selectedLocation, setLocation ] = useState(null)

    const setLocationToCreateForm = (location) => {
        setLocation(location)
        setFormOpen(true)
    }

    const closeForm = () => {
        setLocation(null)
        setFormOpen(false)
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
            />
        </Base>
    )
}

export default SearchPage