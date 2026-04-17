import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Base from './Base'

import { useQuery, useLazyQuery } from '@apollo/client'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material'
import AppleIcon from '@mui/icons-material/Apple'
import AltRouteIcon from '@mui/icons-material/AltRoute'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import TelegramIcon from '@mui/icons-material/Telegram'

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
    const history = useHistory()
    // form open state
    const [ isRelationFormOpen, setRelationFormOpen ] = useState(false)
    const [ isPreferredPinFormOpen, setPreferredPinFormOpen ] = useState(false)
    const [ isPreviewDisplayPinFormOpen, setPreviewDisplayPinFormOpen ] = useState(false)
    const [ isReminderTimeFormOpen, setReminderTimeFormOpen ] = useState(false)
    const [ isReleaseNoteOpen, setReleaseNoteOpen ] = useState(false)
    const [ isShortcutDialogOpen, setShortcutDialogOpen ] = useState(false)
    const [ isShortcutHelpDialogOpen, setShortcutHelpDialogOpen ] = useState(false)
    const [ isTelegramDialogOpen, setTelegramDialogOpen ] = useState(false)
    const [ isTelegramGuideDialogOpen, setTelegramGuideDialogOpen ] = useState(false)

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
        setShortcutDialogOpen(true)
    }

    const closeIOSShortcutInstallDialog = () => {
        setShortcutDialogOpen(false)
    }

    const openIOSShortcutHelpDialog = () => {
        setShortcutDialogOpen(false)
        setShortcutHelpDialogOpen(true)
    }

    const closeIOSShortcutHelpDialog = () => {
        setShortcutHelpDialogOpen(false)
    }

    const confirmIOSShortcutInstall = () => {
        const validatedURL = validateIOSShortcutInstallURL(iosShortcutInstallURL)
        if (!validatedURL) return

        const opened = window.open(validatedURL, '_blank', 'noopener,noreferrer')
        if (opened) {
            opened.opener = null
        }
        setShortcutDialogOpen(false)
    }

    const openTalkToRoroadBot = () => {
        const validatedURL = validateTelegramBotURL(telegramBotURL)
        if (!validatedURL) return
        setTelegramDialogOpen(true)
    }

    const closeTelegramGuideDialog = () => {
        setTelegramGuideDialogOpen(false)
    }

    const closeTelegramDialog = () => {
        setTelegramDialogOpen(false)
    }

    const openTelegramGuideDialog = () => {
        setTelegramDialogOpen(false)
        setTelegramGuideDialogOpen(true)
    }

    const confirmTalkToRoroadBot = () => {
        const validatedURL = validateTelegramBotURL(telegramBotURL)
        if (!validatedURL) return

        const opened = window.open(validatedURL, '_blank', 'noopener,noreferrer')
        if (opened) {
            opened.opener = null
        }
        setTelegramDialogOpen(false)
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

    const openSavedTravelPlans = () => {
        history.replace('/travel-plans')
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
                openSavedTravelPlans={openSavedTravelPlans}
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
            <Dialog
                fullWidth
                maxWidth='sm'
                open={isShortcutDialogOpen}
                onClose={closeIOSShortcutInstallDialog}
            >
                <DialogTitle>Social Media Shortcut (iOS)</DialogTitle>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', position: 'relative', pb: 4 }}>
                    <Button
                        size='large'
                        variant='outlined'
                        aria-label='Download shortcut'
                        onClick={confirmIOSShortcutInstall}
                        sx={{
                            py: 0,
                            width: 160,
                            height: 160,
                            minWidth: 160,
                            minHeight: 160,
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <span
                            style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                            }}
                        >
                            <span
                                style={{
                                    position: 'relative',
                                    display: 'inline-flex',
                                    width: '88px',
                                    height: '88px',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AltRouteIcon style={{ fontSize: '76px' }} />
                                <AppleIcon
                                    style={{
                                        fontSize: '28px',
                                        position: 'absolute',
                                        left: '2px',
                                        bottom: '2px',
                                        background: '#fff',
                                        borderRadius: '999px',
                                        padding: '2px',
                                    }}
                                />
                            </span>
                            <span
                                style={{
                                    fontSize: '11px',
                                    lineHeight: 1,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                install
                            </span>
                        </span>
                    </Button>
                    <IconButton
                        aria-label='Open shortcut usage guide'
                        onClick={openIOSShortcutHelpDialog}
                        size='small'
                        sx={{
                            position: 'absolute',
                            right: '10px',
                            bottom: '8px',
                            color: '#7c8794',
                        }}
                    >
                        <HelpOutlineIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                </DialogContent>
            </Dialog>
            <Dialog
                fullWidth
                maxWidth='md'
                open={isShortcutHelpDialogOpen}
                onClose={closeIOSShortcutHelpDialog}
            >
                <DialogTitle>How to Use the Shortcut</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Box
                                component='img'
                                src='/assets/shortcut-guide/step1.jpg'
                                alt='Step 1: open share options'
                                sx={{ width: '100%', borderRadius: 1.5, border: '1px solid #d9e2ec' }}
                            />
                            <Typography variant='body2' color='text.secondary'>
                                In Instagram or Threads, tap the post&apos;s share button. You should see this menu; choose &quot;Share to...&quot;.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Box
                                component='img'
                                src='/assets/shortcut-guide/step2.jpg'
                                alt='Step 2: select Roroad Analyze'
                                sx={{ width: '100%', borderRadius: 1.5, border: '1px solid #d9e2ec' }}
                            />
                            <Typography variant='body2' color='text.secondary'>
                                Then tap &quot;Roroad Analyze&quot;. If you do not see it, tap &quot;View More&quot; first. You can also favorite the shortcut so it appears pinned here.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                            <Box
                                component='img'
                                src='/assets/shortcut-guide/step3.jpg'
                                alt='Step 3: send auto-filled Telegram message'
                                sx={{ width: '100%', borderRadius: 1.5, border: '1px solid #d9e2ec' }}
                            />
                            <Typography variant='body2' color='text.secondary'>
                                Next, the Telegram chat opens automatically with all your information filled in. Just tap &quot;Send&quot; and you are done.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeIOSShortcutHelpDialog}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullWidth
                maxWidth='sm'
                open={isTelegramDialogOpen}
                onClose={closeTelegramDialog}
            >
                <DialogTitle>Telegram Bot (iOS)</DialogTitle>
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', position: 'relative', pb: 4 }}>
                    <Button
                        size='large'
                        variant='outlined'
                        aria-label='Open Telegram Bot'
                        onClick={confirmTalkToRoroadBot}
                        sx={{
                            py: 0,
                            width: 160,
                            height: 160,
                            minWidth: 160,
                            minHeight: 160,
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <span
                            style={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                            }}
                        >
                            <span
                                style={{
                                    position: 'relative',
                                    display: 'inline-flex',
                                    width: '88px',
                                    height: '88px',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <TelegramIcon style={{ fontSize: '76px' }} />
                            </span>
                            <span
                                style={{
                                    fontSize: '11px',
                                    lineHeight: 1,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                open
                            </span>
                        </span>
                    </Button>
                    <IconButton
                        aria-label='Open Telegram usage guide'
                        onClick={openTelegramGuideDialog}
                        size='small'
                        sx={{
                            position: 'absolute',
                            right: '10px',
                            bottom: '8px',
                            color: '#7c8794',
                        }}
                        >
                        <HelpOutlineIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                    <Typography
                        variant='caption'
                        sx={{
                            position: 'absolute',
                            right: '42px',
                            bottom: '11px',
                            color: '#7c8794',
                            fontSize: '11px',
                            letterSpacing: '0.02em',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                        }}
                    >
                        Setup telegram to use Safari
                    </Typography>
                </DialogContent>
            </Dialog>
            <Dialog
                fullWidth
                maxWidth='md'
                open={isTelegramGuideDialogOpen}
                onClose={closeTelegramGuideDialog}
            >
                <DialogTitle>How to Use Telegram Without the In-App Browser</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 2.5 }}>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 1,
                                p: 2,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                border: '1px solid #bae6fd',
                            }}
                        >
                            <Typography variant='h6' sx={{ fontWeight: 700 }}>
                                Why this matters
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Telegram&apos;s in-app browser can keep links trapped inside the app, which makes handoff to Safari or Chrome less reliable and can interfere with how RoroadMap opens shared links. Set Telegram to open links in an external browser first so the bot flow behaves consistently.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Box
                                    component='img'
                                    src='/assets/telegram-guide/step1.jpg'
                                    alt='Step 1: open Telegram settings'
                                    sx={{ width: '100%', borderRadius: 1.5, border: '1px solid #d9e2ec' }}
                                />
                                <Typography variant='body2' color='text.secondary'>
                                    Step 1: open the Telegram app, then tap Settings from the bottom-right corner.
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Box
                                    component='img'
                                    src='/assets/telegram-guide/step2.jpg'
                                    alt='Step 2: open data and storage'
                                    sx={{ width: '100%', borderRadius: 1.5, border: '1px solid #d9e2ec' }}
                                />
                                <Typography variant='body2' color='text.secondary'>
                                    Step 2: go to Data and Storage so you can adjust how Telegram opens links.
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Box
                                    component='img'
                                    src='/assets/telegram-guide/step3.jpg'
                                    alt='Step 3: open links in browser settings'
                                    sx={{ width: '100%', borderRadius: 1.5, border: '1px solid #d9e2ec' }}
                                />
                                <Typography variant='body2' color='text.secondary'>
                                    Step 3: find Open Links In, or the Browser section, to choose where links should open.
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gap: 1 }}>
                                <Box
                                    component='img'
                                    src='/assets/telegram-guide/step4.jpg'
                                    alt='Step 4: choose an external browser'
                                    sx={{ width: '100%', borderRadius: 1.5, border: '1px solid #d9e2ec' }}
                                />
                                <Typography variant='body2' color='text.secondary'>
                                    Step 4: select Safari, Chrome, or another external browser instead of the in-app browser.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeTelegramGuideDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Base>
    )
}

export default connect(state => ({
    list: state.release.list,
    seen: state.release.seen,
    latest: state.release.latest,
    jwt: state.auth.jwt,
})) (SettingPage)
