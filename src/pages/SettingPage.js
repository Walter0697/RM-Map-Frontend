import React, { useState, useEffect } from 'react'
import Base from './Base'

import { useQuery } from '@apollo/client'

import SettingList from '../components/setting/SettingList'
import RelationSearchForm from '../components/form/RelationSearchForm'

import graphql from '../graphql'

// TODO : add top bar
// TODO : add preference info into cachable local storage

function SettingPage() {
    const [ isRelationFormOpen, setRelationFormOpen ] = useState(false)

    const { data: preferenceData, loading: preferenceLoading, error: preferenceError } = useQuery(graphql.users.preference, { errorPolicy: 'all' })

    useEffect(() => {
        if (preferenceData) {
            console.log(preferenceData)
        }

        if (preferenceError) {
            console.log(preferenceError)
        }
    }, [preferenceData, preferenceError])

    const openRelationForm = () => {
        setRelationFormOpen(true)
    }

    const closeRelationForm = () => {
        setRelationFormOpen(false)
    }

    return (
        <Base>
            <SettingList 
                openRelationChange={openRelationForm}
            />
            <RelationSearchForm
                open={isRelationFormOpen}
                handleClose={closeRelationForm}
                onCreated={closeRelationForm}
            />
        </Base>
    )
}

export default SettingPage