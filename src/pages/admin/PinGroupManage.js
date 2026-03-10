import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

import AdminPageShell from '../../components/admin/AdminPageShell'
import backend from '../../constant/backend'

function PinGroupManage({ jwt }) {
    const [ loading, setLoading ] = useState(false)
    const [ saving, setSaving ] = useState(false)
    const [ list, setList ] = useState([])
    const [ createName, setCreateName ] = useState('')
    const [ createIsNew, setCreateIsNew ] = useState(false)
    const [ editingID, setEditingID ] = useState(null)
    const [ editingName, setEditingName ] = useState('')
    const [ editingIsNew, setEditingIsNew ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ successMessage, setSuccessMessage ] = useState('')

    const canCreate = useMemo(() => createName.trim().length > 0 && !saving, [createName, saving])

    const fetchGroups = async () => {
        if (!jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath('admin/pin-groups'), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                setErrorMessage(text || `Failed to load pin groups (${response.status})`)
                return
            }
            const data = await response.json()
            setList(Array.isArray(data) ? data : [])
        } catch (error) {
            setErrorMessage(error.message || 'Failed to load pin groups')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [jwt])

    const createGroup = async () => {
        if (!canCreate || !jwt) return
        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')
        try {
            const response = await fetch(backend.withBasePath('admin/pin-groups'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify({ name: createName.trim(), is_new: createIsNew }),
            })
            if (!response.ok) {
                const text = await response.text()
                setErrorMessage(text || `Failed to create pin group (${response.status})`)
                return
            }
            setCreateName('')
            setCreateIsNew(false)
            setSuccessMessage('Pin group created')
            fetchGroups()
        } catch (error) {
            setErrorMessage(error.message || 'Failed to create pin group')
        } finally {
            setSaving(false)
        }
    }

    const updateGroup = async (id) => {
        if (!jwt || !editingName.trim()) return
        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')
        try {
            const response = await fetch(backend.withBasePath(`admin/pin-groups/${id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: jwt,
                },
                body: JSON.stringify({ name: editingName.trim(), is_new: editingIsNew }),
            })
            if (!response.ok) {
                const text = await response.text()
                setErrorMessage(text || `Failed to update pin group (${response.status})`)
                return
            }
            setEditingID(null)
            setEditingName('')
            setEditingIsNew(false)
            setSuccessMessage('Pin group updated')
            fetchGroups()
        } catch (error) {
            setErrorMessage(error.message || 'Failed to update pin group')
        } finally {
            setSaving(false)
        }
    }

    const deleteGroup = async (id, name) => {
        if (!jwt) return
        if (!window.confirm(`Delete pin group "${name}"? Assigned pins will become ungrouped.`)) return
        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')
        try {
            const response = await fetch(backend.withBasePath(`admin/pin-groups/${id}`), {
                method: 'DELETE',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) {
                const text = await response.text()
                setErrorMessage(text || `Failed to delete pin group (${response.status})`)
                return
            }
            setSuccessMessage('Pin group deleted')
            fetchGroups()
        } catch (error) {
            setErrorMessage(error.message || 'Failed to delete pin group')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminPageShell
            title='Pin Group Manage'
            description='Create reusable pin groups and maintain names for user settings organization.'
        >
            <Stack spacing={2}>
                {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
                {successMessage ? <Alert severity='success'>{successMessage}</Alert> : null}

                <Card className='admin-panel'>
                    <CardContent>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 1 }}>Create Group</Typography>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                            <TextField
                                label='Group name'
                                value={createName}
                                onChange={(event) => setCreateName(event.target.value)}
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={createIsNew}
                                        onChange={(event) => setCreateIsNew(event.target.checked)}
                                    />
                                }
                                label='Mark as New'
                            />
                            <Button variant='contained' disabled={!canCreate} onClick={createGroup}>
                                Add Group
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {loading ? (
                    <Typography variant='body2' color='text.secondary'>Loading groups...</Typography>
                ) : null}

                {list.map((item) => (
                    <Card key={item.id} className='admin-panel'>
                        <CardContent>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                    {editingID === item.id ? (
                                        <Stack spacing={1}>
                                            <TextField
                                                fullWidth
                                                label='Group name'
                                                value={editingName}
                                                onChange={(event) => setEditingName(event.target.value)}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={editingIsNew}
                                                        onChange={(event) => setEditingIsNew(event.target.checked)}
                                                    />
                                                }
                                                label='Mark as New'
                                            />
                                        </Stack>
                                    ) : (
                                        <Stack direction='row' spacing={1} alignItems='center'>
                                            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>{item.name}</Typography>
                                            {item.is_new ? <Chip size='small' color='warning' label='NEW' /> : null}
                                        </Stack>
                                    )}
                                </Box>
                                {editingID === item.id ? (
                                    <Stack direction='row' spacing={1}>
                                        <Button
                                            variant='contained'
                                            onClick={() => updateGroup(item.id)}
                                            disabled={saving || !editingName.trim()}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant='outlined'
                                            onClick={() => {
                                                setEditingID(null)
                                                setEditingName('')
                                                setEditingIsNew(false)
                                            }}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Stack direction='row' spacing={1}>
                                        <Button
                                            variant='outlined'
                                            onClick={() => {
                                                setEditingID(item.id)
                                                setEditingName(item.name || '')
                                                setEditingIsNew(Boolean(item.is_new))
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            color='error'
                                            variant='outlined'
                                            onClick={() => deleteGroup(item.id, item.name)}
                                            disabled={saving}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </AdminPageShell>
    )
}

export default connect((state) => ({
    jwt: state.auth.jwt,
}))(PinGroupManage)
