import React, { useState, useEffect } from 'react'
import Base from './Base'

import { useQuery } from '@apollo/client'

import TopBar from '../components/topbar/TopBar'
import SettingList from '../components/setting/SettingList'
import RelationSearchForm from '../components/form/RelationSearchForm'

import graphql from '../graphql'

// TODO : add preference info into cachable local storage

function SettingPage() {
    // form open state
    const [ isRelationFormOpen, setRelationFormOpen ] = useState(false)

    // user information
    const [ relationUser, setRelation ] = useState(null) // TODO: default value would be from localstorage

    // graphql request
    const { data: preferenceData, loading: preferenceLoading, error: preferenceError } = useQuery(graphql.users.preference, { errorPolicy: 'all' })

    useEffect(() => {
        if (preferenceData) {
            if (preferenceData.preference?.relation?.username) {
                setRelation(preferenceData.preference.relation.username)
            } 
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

    const onChangeRelation = (username) => {
        setRelation(username)
        setRelationFormOpen(false)
    }

    return (
        <Base>
            <TopBar 
                label='Settings'
            />
            <SettingList 
                relationUser={relationUser}
                openRelationChange={openRelationForm}
            />
            <RelationSearchForm
                open={isRelationFormOpen}
                handleClose={closeRelationForm}
                onCreated={onChangeRelation}
            />
        </Base>
    )
}

export default SettingPage