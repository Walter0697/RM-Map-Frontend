import React, { useEffect, useMemo, useState } from 'react'
import { Alert, TextField } from '@mui/material'

import BaseForm from '../BaseForm'
import backend from '../../../constant/backend'

function normalizeReminderTime(value) {
    if (!value || typeof value !== 'string') return ''
    const trimmed = value.trim()
    const matched = trimmed.match(/^(\d{1,2}):(\d{1,2})$/)
    if (!matched) return ''
    const hour = Number(matched[1])
    const minute = Number(matched[2])
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return ''
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return ''
    return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`
}

function ReminderTimeForm({
    open,
    handleClose,
    jwt,
    currentTime,
    onUpdated,
}) {
    const [ reminderTime, setReminderTime ] = useState('09:00')
    const [ loading, setLoading ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')

    useEffect(() => {
        if (!open) return
        setErrorMessage('')
        setReminderTime(normalizeReminderTime(currentTime) || '09:00')
    }, [open, currentTime])

    const confirmLoading = useMemo(() => {
        if (loading) return true
        return normalizeReminderTime(reminderTime) === ''
    }, [loading, reminderTime])

    const onSubmitHandler = async () => {
        if (!jwt) return
        const normalized = normalizeReminderTime(reminderTime)
        if (!normalized) {
            setErrorMessage('Reminder time must be HH:MM in 24-hour format')
            return
        }

        setLoading(true)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath('settings/reminder-time'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify({ time: normalized }),
            })
            if (!response.ok) {
                const raw = await response.text()
                try {
                    const parsed = JSON.parse(raw)
                    setErrorMessage(parsed.message || parsed.error || raw || 'Failed to update reminder time')
                } catch (error) {
                    setErrorMessage(raw || 'Failed to update reminder time')
                }
                return
            }

            const payload = await response.json()
            onUpdated && onUpdated(payload)
        } catch (error) {
            setErrorMessage(error.message || 'Failed to update reminder time')
        } finally {
            setLoading(false)
        }
    }

    return (
        <BaseForm
            open={open}
            handleClose={handleClose}
            title={'RoroadBot Reminder Time'}
            maxWidth={'sm'}
            handleSubmit={onSubmitHandler}
            cancelText={'Cancel'}
            createText={'Confirm'}
            loading={confirmLoading}
        >
            {errorMessage ? (
                <Alert severity='error' style={{ marginBottom: '12px' }}>
                    {errorMessage}
                </Alert>
            ) : null}
            <TextField
                fullWidth
                label='Preferred Reminder Time'
                type='time'
                value={normalizeReminderTime(reminderTime) || reminderTime}
                onChange={(event) => setReminderTime(event.target.value)}
                inputProps={{ step: 60 }}
                helperText='Used by schedule reminder automation (24-hour HH:MM)'
            />
        </BaseForm>
    )
}

export default ReminderTimeForm
