import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Base from './Base'

import { useQuery, useLazyQuery } from '@apollo/client'

import TopBar from '../components/topbar/TopBar'
import SettingList from '../components/list/SettingList'
import RelationSearchForm from '../components/form/settings/RelationSearchForm'
import PreferredPinForm from '../components/form/settings/PreferredPinForm'
import PreviewDisplayPinForm from '../components/form/settings/PreviewDisplayPinForm'
import ReminderTimeForm from '../components/form/settings/ReminderTimeForm'
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

function validateTelegramBotURL(rawURL) {
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
    const [ isReminderTimeFormOpen, setReminderTimeFormOpen ] = useState(false)
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
    const [ telegramBotURL, setTelegramBotURL ] = useState('')
    const [ reminderTime, setReminderTime ] = useState('09:00')
    const [ calendarProviderStatus, setCalendarProviderStatus ] = useState('')
    const [ calendarProviderLoading, setCalendarProviderLoading ] = useState(false)
    const [ calendarProviderActionLoading, setCalendarProviderActionLoading ] = useState(false)

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

    }, [preferenceData, preferenceError])

    useEffect(() => {
        if (releaseData) {
            latestReleaseGQL()
        }

    }, [releaseData, releaseError])

    useEffect(() => {
        if (latestReleaseData) {
            dispatch(actions.updateReleaseLatest(latestReleaseData.latestreleasenote))
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
                        pin_image_path: data.pin_image_path || '',
                    })
                }

                const reminderResponse = await fetch(backend.withBasePath('settings/reminder-time'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (reminderResponse.ok) {
                    const reminderData = await reminderResponse.json()
                    setReminderTime(reminderData?.time || '09:00')
                } else {
                    setReminderTime('09:00')
                }

                const telegramBotResponse = await fetch(backend.withBasePath('settings/telegram-bot-url'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (telegramBotResponse.ok) {
                    const telegramBotData = await telegramBotResponse.json()
                    setTelegramBotURL(validateTelegramBotURL(telegramBotData?.telegram_bot_url))
                } else {
                    setTelegramBotURL('')
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
            } catch {
                setReminderTime('09:00')
                setTelegramBotURL('')
                setIOSShortcutInstallURL('')
            }
        }

        fetchSettingsConfig()
    }, [jwt])

    useEffect(() => {
        const fetchCalendarProviderStatus = async () => {
            if (!jwt) return
            setCalendarProviderLoading(true)
            try {
                const response = await fetch(backend.withBasePath('calendar/providers/status'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!response.ok) {
                    setCalendarProviderStatus('')
                    return
                }
                const payload = await response.json()
                const items = Array.isArray(payload?.items) ? payload.items : []
                const google = items.find((item) => `${item?.provider_key || ''}`.trim().toLowerCase() === 'google_calendar')
                setCalendarProviderStatus(`${google?.status || ''}`.trim().toLowerCase())
            } catch {
                setCalendarProviderStatus('')
            } finally {
                setCalendarProviderLoading(false)
            }
        }

        fetchCalendarProviderStatus()
    }, [jwt])

    const openIOSShortcutInstall = () => {
        const validatedURL = validateIOSShortcutInstallURL(iosShortcutInstallURL)
        if (!validatedURL) return

        const opened = window.open(validatedURL, '_blank', 'noopener,noreferrer')
        if (opened) {
            opened.opener = null
        }
    }

    const openTalkToRoroadBot = () => {
        const validatedURL = validateTelegramBotURL(telegramBotURL)
        if (!validatedURL) return

        const opened = window.open(validatedURL, '_blank', 'noopener,noreferrer')
        if (opened) {
            opened.opener = null
        }
    }

    const openGoogleCalendarConnect = () => {
        const target = backend.withBasePath(`calendar/google/connect?token=${encodeURIComponent(jwt || '')}`)
        window.location.href = target
    }

    const disconnectGoogleCalendar = async () => {
        if (!jwt) return
        setCalendarProviderActionLoading(true)
        try {
            const response = await fetch(backend.withBasePath('calendar/providers/google_calendar/disconnect'), {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                },
            })
            if (response.ok) {
                setCalendarProviderStatus('disconnected')
            }
        } finally {
            setCalendarProviderActionLoading(false)
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

    const openReminderTimeForm = () => {
        setReminderTimeFormOpen(true)
    }

    const closeReminderTimeForm = () => {
        setReminderTimeFormOpen(false)
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
            pin_image_path: payload?.pin_image_path || '',
        })
        setPreviewDisplayPinFormOpen(false)
    }

    const onReminderTimeUpdated = (payload) => {
        setReminderTime(payload?.time || '09:00')
        setReminderTimeFormOpen(false)
    }

    useEffect(() => {
        if (!previewDisplayPin?.pin_id) {
            setPreviewDisplayPin((prev) => ({
                ...prev,
                pin_label: '',
                pin_image_path: '',
            }))
            return
        }
        if (!pinSelectData?.pins) return
        const selectedPin = pinSelectData.pins.find((item) => Number(item.id) === Number(previewDisplayPin.pin_id))
        setPreviewDisplayPin((prev) => ({
            ...prev,
            pin_label: prev?.pin_label || selectedPin?.label || '',
            pin_image_path: selectedPin?.image_path || selectedPin?.display_path || prev?.pin_image_path || '',
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
                showCalendarConnectionCTA={true}
                isGoogleCalendarConnected={calendarProviderStatus === 'active'}
                isGoogleCalendarLoading={calendarProviderLoading || calendarProviderActionLoading}
                openGoogleCalendarConnect={openGoogleCalendarConnect}
                disconnectGoogleCalendar={disconnectGoogleCalendar}
                reminderTime={reminderTime}
                openReminderTimeForm={openReminderTimeForm}
                openTalkToRoroadBot={openTalkToRoroadBot}
                showTalkToRoroadBot={!!validateTelegramBotURL(telegramBotURL)}
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
                jwt={jwt}
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
            <ReminderTimeForm
                open={isReminderTimeFormOpen}
                handleClose={closeReminderTimeForm}
                jwt={jwt}
                currentTime={reminderTime}
                onUpdated={onReminderTimeUpdated}
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
