import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Base from './Base'

import { useQuery, useLazyQuery } from '@apollo/client'

import TopBar from '../components/topbar/TopBar'
import SettingList from '../components/list/SettingList'
import RelationSearchForm from '../components/form/settings/RelationSearchForm'
import PreferredPinForm from '../components/form/settings/PreferredPinForm'
import ReleaseNoteForm from '../components/form/settings/ReleaseNoteForm'

import constants from '../constant'
import actions from '../store/actions'
import graphql from '../graphql'

function SettingPage({ 
    latest,
    seen,
    list,    
    dispatch,
}) {
    // form open state
    const [ isRelationFormOpen, setRelationFormOpen ] = useState(false)
    const [ isPreferredPinFormOpen, setPreferredPinFormOpen ] = useState(false)
    const [ isReleaseNoteOpen, setReleaseNoteOpen ] = useState(false)

    // selected open item
    const [ updatingPreferredPin, setPreferredPin ] = useState(null)

    // user information
    const [ relationUser, setRelation ] = useState(null) // TODO: default value would be from localstorage
    const [ pinPreference, setPinPreference ] = useState(null)

    // graphql request
    const { data: preferenceData, loading: preferenceLoading, error: preferenceError } = useQuery(graphql.users.preference, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
    const { data: releaseData, loading: releaseLoading, error: releaseError } = useQuery(graphql.releasenotes.list, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
    // for updating the release note if there is a new one
    const [ latestReleaseGQL, { data: latestReleaseData, loading: latestReleaseLoading, error: latestReleaseError } ] = useLazyQuery(graphql.releasenotes.latest, { fetchPolicy: 'no-cache' })
    // for updating the map pins after changing the preferred pin
    const [ listMappinsGQL, { data: mappinsData } ] = useLazyQuery(graphql.pins.mappins, { fetchPolicy: 'no-cache' })

    useEffect(() => {
        if (preferenceData) {
            if (preferenceData.preference?.relation?.username) {
                setRelation(preferenceData.preference.relation.username)
            } 

            let pinList = []
            constants.pins.pinTypes.forEach(( item, index) => {
                if (preferenceData.preference && preferenceData.preference[item.identifier]) {
                    pinList.push({
                        exist: true,
                        name: item.name,
                        label: item.label,
                        pin_id: preferenceData.preference[item.identifier].id,
                        pin_label: preferenceData.preference[item.identifier].label,
                        image_path: preferenceData.preference[item.identifier].display_path,
                    })
                } else {
                    pinList.push({
                        exist: false,
                        name: item.name,
                        label: item.label,
                    })
                }
            })
            setPinPreference(pinList)
        } 

        if (preferenceError) {
            console.log(preferenceError)
        }
    }, [preferenceData, preferenceError])

    useEffect(() => {
        if (releaseData) {
            latestReleaseGQL()
        }

        if (releaseError) {
            console.log(releaseError)
        }
    }, [releaseData, releaseError])

    useEffect(() => {
        if (latestReleaseData) {
            dispatch(actions.updateReleaseLatest(latestReleaseData.latestreleasenote))
        }

        if (latestReleaseError) {
            console.log(latestReleaseError)
        }
    }, [latestReleaseData, latestReleaseError])

    useEffect(() => {
        if (mappinsData) {
            dispatch(actions.resetMappins(mappinsData.mappins))
        }
    }, [mappinsData])

    const openPreferredPinForm = (pin) => {
        setPreferredPin(pin)
        setPreferredPinFormOpen(true)
    }

    const closePreferredPinForm = () => {
        setPreferredPin(null)
        setPreferredPinFormOpen(false)
    }

    const onChangePreferredPin = (pin) => {
        setPreferredPin(null)
        setPreferredPinFormOpen(false)

        let pinList = []
        constants.pins.pinTypes.forEach(( item, index) => {
            if (pin.updatePreferredPin && pin.updatePreferredPin[item.identifier]) {
                pinList.push({
                    exist: true,
                    name: item.name,
                    label: item.label,
                    pin_id: pin.updatePreferredPin[item.identifier].id,
                    pin_label: pin.updatePreferredPin[item.identifier].label,
                    image_path: pin.updatePreferredPin[item.identifier].display_path,
                })
            } else {
                pinList.push({
                    exist: false,
                    name: item.name,
                    label: item.label,
                })
            }
        })
        setPinPreference(pinList)
        listMappinsGQL()
    }

    const openRelationForm = () => {
        setRelationFormOpen(true)
    }

    const closeRelationForm = () => {
        setRelationFormOpen(false)
    }

    const openReleaseNote = () => {
        setReleaseNoteOpen(true)
    }

    const closeReleaseNote = () => {
        setReleaseNoteOpen(false)
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
                pinPreference={pinPreference}
                openPreferredPinForm={openPreferredPinForm}
                latestVersionRelease={latest ? latest.version : ''}
                seenRelease={seen}
                openReleaseNote={openReleaseNote}
            />
            <RelationSearchForm
                open={isRelationFormOpen}
                handleClose={closeRelationForm}
                onCreated={onChangeRelation}
            />
            <PreferredPinForm 
                open={isPreferredPinFormOpen}
                handleClose={closePreferredPinForm}
                pinInfo={updatingPreferredPin}
                onCreated={onChangePreferredPin}
            />
            <ReleaseNoteForm
                open={isReleaseNoteOpen}
                handleClose={closeReleaseNote}
            />
        </Base>
    )
}

export default connect(state => ({
    list: state.release.list,
    seen: state.release.seen,
    latest: state.release.latest,
})) (SettingPage)