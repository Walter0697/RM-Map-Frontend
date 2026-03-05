import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Base from './Base'

import { useQuery, useLazyQuery } from '@apollo/client'

import TopBar from '../components/topbar/TopBar'
import SettingList from '../components/list/SettingList'
import RelationSearchForm from '../components/form/settings/RelationSearchForm'
import PreferredPinForm from '../components/form/settings/PreferredPinForm'
import PreviewDisplayPinForm from '../components/form/settings/PreviewDisplayPinForm'
import ReleaseNoteForm from '../components/form/settings/ReleaseNoteForm'

import constants from '../constant'
import backend from '../constant/backend'
import actions from '../store/actions'
import graphql from '../graphql'

function validateIOSShortcutInstallURL(rawURL) {
    if (!rawURL || typeof rawURL !== 'string') return ''
    const trimmed = rawURL.trim()
    if (!trimmed) return ''

    try {
        const parsed = new URL(trimmed)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return ''
        }
        if (!parsed.hostname) {
            return ''
        }
        return trimmed
    } catch (error) {
        return ''
    }
}

function SettingPage({ 
    latest,
    seen,
    list,    
    dispatch,
    jwt,
}) {
    // form open state
    const [ isRelationFormOpen, setRelationFormOpen ] = useState(false)
    const [ isPreferredPinFormOpen, setPreferredPinFormOpen ] = useState(false)
    const [ isPreviewDisplayPinFormOpen, setPreviewDisplayPinFormOpen ] = useState(false)
    const [ isReleaseNoteOpen, setReleaseNoteOpen ] = useState(false)

    // selected open item
    const [ updatingPreferredPin, setPreferredPin ] = useState(null)

    // user information
    const [ relationUser, setRelation ] = useState(null) // TODO: default value would be from localstorage
    const [ pinPreference, setPinPreference ] = useState(null)
    const [ previewDisplayPin, setPreviewDisplayPin ] = useState({
        pin_id: null,
        pin_label: '',
        pin_image_path: '',
    })
    const [ iosShortcutInstallURL, setIOSShortcutInstallURL ] = useState('')

    // graphql request
    const { data: preferenceData, loading: preferenceLoading, error: preferenceError } = useQuery(graphql.users.preference, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
    const { data: releaseData, loading: releaseLoading, error: releaseError } = useQuery(graphql.releasenotes.list, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
    const { data: pinSelectData } = useQuery(graphql.pins.select, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
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

    useEffect(() => {
        const fetchSettingsConfig = async () => {
            if (!jwt) return
            try {
                const response = await fetch(backend.withBasePath('settings/preview-pin'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (response.ok) {
                    const data = await response.json()
                    setPreviewDisplayPin({
                        pin_id: data.pin_id || null,
                        pin_label: data.pin_label || '',
                        pin_image_path: '',
                    })
                }

                const shortcutResponse = await fetch(backend.withBasePath('settings/ios-shortcut-install-url'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (shortcutResponse.ok) {
                    const shortcutData = await shortcutResponse.json()
                    setIOSShortcutInstallURL(validateIOSShortcutInstallURL(shortcutData?.ios_shortcut_install_url))
                } else {
                    setIOSShortcutInstallURL('')
                }
            } catch (error) {
                console.log(error)
                setIOSShortcutInstallURL('')
            }
        }

        fetchSettingsConfig()
    }, [jwt])

    const openIOSShortcutInstall = () => {
        const validatedURL = validateIOSShortcutInstallURL(iosShortcutInstallURL)
        if (!validatedURL) return

        const opened = window.open(validatedURL, '_blank', 'noopener,noreferrer')
        if (opened) {
            opened.opener = null
        }
    }

    const openPreferredPinForm = (pin) => {
        setPreferredPin(pin)
        setPreferredPinFormOpen(true)
    }

    const closePreferredPinForm = () => {
        setPreferredPin(null)
        setPreferredPinFormOpen(false)
    }

    const openPreviewDisplayPinForm = () => {
        setPreviewDisplayPinFormOpen(true)
    }

    const closePreviewDisplayPinForm = () => {
        setPreviewDisplayPinFormOpen(false)
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

    const onChangePreviewDisplayPin = (payload) => {
        setPreviewDisplayPin({
            pin_id: payload?.pin_id || null,
            pin_label: payload?.pin_label || '',
            pin_image_path: '',
        })
        setPreviewDisplayPinFormOpen(false)
    }

    useEffect(() => {
        if (!previewDisplayPin?.pin_id) {
            setPreviewDisplayPin((prev) => ({
                ...prev,
                pin_image_path: '',
            }))
            return
        }
        if (!pinSelectData?.pins) return
        const selectedPin = pinSelectData.pins.find((item) => item.id === previewDisplayPin.pin_id)
        setPreviewDisplayPin((prev) => ({
            ...prev,
            pin_image_path: selectedPin?.display_path || '',
        }))
    }, [pinSelectData, previewDisplayPin.pin_id])

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
                previewPinLabel={previewDisplayPin.pin_label}
                previewPinImagePath={previewDisplayPin.pin_image_path}
                openPreviewDisplayPinForm={openPreviewDisplayPinForm}
                showIOSShortcutInstallCTA={!!validateIOSShortcutInstallURL(iosShortcutInstallURL)}
                openIOSShortcutInstall={openIOSShortcutInstall}
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
            <PreviewDisplayPinForm
                open={isPreviewDisplayPinFormOpen}
                handleClose={closePreviewDisplayPinForm}
                jwt={jwt}
                currentPinId={previewDisplayPin.pin_id}
                onUpdated={onChangePreviewDisplayPin}
            />
        </Base>
    )
}

export default connect(state => ({
    list: state.release.list,
    seen: state.release.seen,
    latest: state.release.latest,
    jwt: state.auth.jwt,
})) (SettingPage)
