import React, { useEffect, useMemo, useState } from 'react'
import { connect } from 'react-redux'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'

import backend from '../../constant/backend'
import AdminPageShell from '../../components/admin/AdminPageShell'
import appPackage from '../../../package.json'

function normalizeSemver(input) {
    const value = `${input || ''}`.trim().toLowerCase().replace(/^v/, '')
    if (!value) return ''
    const noBuild = value.split('+')[0]
    const main = noBuild.split('-')[0]
    const segments = main.split('.')
    if (segments.length < 3 || segments.slice(0, 3).some((item) => !/^\d+$/.test(item))) return ''
    return noBuild
}

function compareSemver(a, b) {
    const normalizeParts = (value) => {
        const normalized = normalizeSemver(value)
        const [main, pre = ''] = normalized.split('-', 2)
        const numbers = main.split('.').slice(0, 3).map((item) => Number(item))
        return { numbers, pre }
    }

    const left = normalizeParts(a)
    const right = normalizeParts(b)
    for (let index = 0; index < 3; index += 1) {
        if (left.numbers[index] > right.numbers[index]) return 1
        if (left.numbers[index] < right.numbers[index]) return -1
    }

    if (!left.pre && !right.pre) return 0
    if (!left.pre) return 1
    if (!right.pre) return -1
    const leftParts = left.pre.split('.')
    const rightParts = right.pre.split('.')
    const max = Math.max(leftParts.length, rightParts.length)
    for (let index = 0; index < max; index += 1) {
        if (index >= leftParts.length) return -1
        if (index >= rightParts.length) return 1
        const l = leftParts[index]
        const r = rightParts[index]
        const ln = /^\d+$/.test(l) ? Number(l) : null
        const rn = /^\d+$/.test(r) ? Number(r) : null
        if (ln !== null && rn !== null) {
            if (ln > rn) return 1
            if (ln < rn) return -1
            continue
        }
        if (ln !== null) return -1
        if (rn !== null) return 1
        if (l > r) return 1
        if (l < r) return -1
    }

    return 0
}

function ReleaseNotesManage({ jwt }) {
    const baselineVersion = useMemo(() => normalizeSemver(appPackage.version || ''), [])
    const [items, setItems] = useState([])
    const [selectedID, setSelectedID] = useState('new')
    const [selectedVersion, setSelectedVersion] = useState('')
    const [version, setVersion] = useState('')
    const [content, setContent] = useState('')
    const [notesFormat, setNotesFormat] = useState('md')
    const [publishState, setPublishState] = useState('draft')
    const [imageRefs, setImageRefs] = useState([])
    const [iconRef, setIconRef] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const isExistingNote = selectedID !== 'new'
    const normalizedVersion = normalizeSemver(version)
    const normalizedSelectedVersion = normalizeSemver(selectedVersion)
    const isVersionValid = normalizedVersion !== ''
    const versionChanged = isExistingNote && normalizedSelectedVersion !== '' && normalizedVersion !== normalizedSelectedVersion
    const requiresVersionProgression = !isExistingNote || versionChanged
    const isVersionProgressed = isVersionValid && compareSemver(version, baselineVersion) > 0
    const isVersionAllowed = isVersionValid && (!requiresVersionProgression || isVersionProgressed)
    const canPublish = publishState === 'published'
        ? (requiresVersionProgression ? isVersionProgressed : true)
        : true

    const resetForm = () => {
        setSelectedID('new')
        setSelectedVersion('')
        setVersion('')
        setContent('')
        setNotesFormat('md')
        setPublishState('draft')
        setImageRefs([])
        setIconRef('')
    }

    const applyItem = (item) => {
        setSelectedID(`${item.id}`)
        setSelectedVersion(item.version || '')
        setVersion(item.version || '')
        setContent(item.content || '')
        setNotesFormat(item.notes_format || 'md')
        setPublishState(item.publish_state || 'draft')
        setImageRefs(Array.isArray(item.image_refs) ? item.image_refs : [])
        setIconRef(item.icon_ref || '')
    }

    const parseResponseError = async (resp) => {
        const text = await resp.text()
        return text || `${resp.status} ${resp.statusText}`
    }

    const load = async () => {
        if (!jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const response = await fetch(backend.withBasePath('admin/release-notes'), {
                method: 'GET',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) throw new Error(await parseResponseError(response))
            const payload = await response.json()
            const list = Array.isArray(payload) ? payload : []
            setItems(list)
            if (selectedID !== 'new') {
                const selected = list.find((item) => `${item.id}` === `${selectedID}`)
                if (selected) applyItem(selected)
            }
        } catch (error) {
            setErrorMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [jwt])

    const submit = async () => {
        if (!jwt) return
        if (!version.trim() || !content.trim()) {
            setErrorMessage('Version and content are required.')
            return
        }
        if (!isVersionValid) {
            setErrorMessage('Version must be valid semantic version (for example 2.9.5).')
            return
        }
        if (!isVersionAllowed) {
            setErrorMessage(`Version must be greater than app version ${baselineVersion}.`)
            return
        }
        if (!canPublish) {
            setErrorMessage(`Publish is blocked until version is greater than ${baselineVersion}.`)
            return
        }

        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')
        try {
            const method = selectedID === 'new' ? 'POST' : 'PUT'
            const path = selectedID === 'new' ? 'admin/release-notes' : `admin/release-notes/${selectedID}`
            const response = await fetch(backend.withBasePath(path), {
                method,
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: version.trim(),
                    content,
                    content_format: 'markdown',
                    notes_format: notesFormat,
                    icon_ref: iconRef,
                    publish_state: publishState,
                    image_refs: imageRefs,
                }),
            })
            if (!response.ok) throw new Error(await parseResponseError(response))
            const payload = await response.json()
            setSuccessMessage(selectedID === 'new' ? 'Release note created.' : 'Release note updated.')
            await load()
            applyItem(payload)
        } catch (error) {
            setErrorMessage(error.message)
        } finally {
            setSaving(false)
        }
    }

    const setPublishedState = async (state) => {
        if (!jwt || selectedID === 'new') return
        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')
        try {
            const response = await fetch(backend.withBasePath(`admin/release-notes/${selectedID}/${state === 'published' ? 'publish' : 'unpublish'}`), {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) throw new Error(await parseResponseError(response))
            const payload = await response.json()
            setPublishState(payload.publish_state || state)
            setSuccessMessage(state === 'published' ? 'Release note published.' : 'Release note moved to draft.')
            await load()
        } catch (error) {
            setErrorMessage(error.message)
        } finally {
            setSaving(false)
        }
    }

    const uploadImage = async (file) => {
        if (!file || !jwt) return
        setErrorMessage('')
        setSuccessMessage('')
        const formData = new FormData()
        formData.append('file', file)
        try {
            const response = await fetch(backend.withBasePath('admin/release-notes/images'), {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                },
                body: formData,
            })
            if (!response.ok) throw new Error(await parseResponseError(response))
            const payload = await response.json()
            const path = payload.path || payload.url
            if (!path) throw new Error('Upload response missing path.')
            if (!imageRefs.includes(path)) {
                setImageRefs((previous) => [...previous, path])
            }
            if (!iconRef) {
                setIconRef(path)
            }
            if (notesFormat === 'json') {
                setNotesFormat('md')
            }
            setContent((previous) => `${previous}${previous ? '\n' : ''}![release-note-image](${payload.url || `/image${path}`})`)
            setSuccessMessage('Image uploaded and inserted into content.')
        } catch (error) {
            setErrorMessage(error.message)
        }
    }

    return (
        <AdminPageShell
            title='Release Notes'
            description='Create, edit, and publish release notes with semver safeguards.'
            actions={(
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button className='admin-action-button' variant='outlined' onClick={load} disabled={loading || saving}>Refresh</Button>
                    <Button className='admin-action-button' variant='outlined' onClick={resetForm} disabled={saving}>New Draft</Button>
                    <Button className='admin-action-button' variant='contained' onClick={submit} disabled={loading || saving || !canPublish}>Save</Button>
                </Stack>
            )}
        >
            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity='success'>{successMessage}</Alert> : null}

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    width: '100%',
                    alignItems: 'stretch',
                }}
            >
                <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
                    <Card className='admin-panel'>
                        <CardContent>
                            <Stack spacing={1.25}>
                                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Saved Release Notes</Typography>
                                {items.map((item) => (
                                    <Button
                                        key={item.id}
                                        variant={`${item.id}` === `${selectedID}` ? 'contained' : 'outlined'}
                                        className='admin-action-button'
                                        onClick={() => applyItem(item)}
                                        sx={{ justifyContent: 'space-between' }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {item.icon_url ? (
                                                <img
                                                    src={item.icon_url}
                                                    alt='release-note-icon'
                                                    style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }}
                                                />
                                            ) : null}
                                            <span>{item.version}</span>
                                        </span>
                                        <span style={{ display: 'flex', gap: 6 }}>
                                            <Chip size='small' label={item.notes_format || 'md'} />
                                            <Chip size='small' label={item.publish_state || 'draft'} color={item.publish_state === 'published' ? 'success' : 'default'} />
                                        </span>
                                    </Button>
                                ))}
                                {items.length === 0 ? <Typography variant='body2' color='text.secondary'>No release notes yet.</Typography> : null}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Card className='admin-panel' sx={{ width: '100%' }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`App baseline: ${baselineVersion || 'unknown'}`} />
                                    <Chip label={isVersionProgressed ? 'Version OK' : 'Version blocked'} color={isVersionProgressed ? 'success' : 'warning'} />
                                    <Chip label={`Current state: ${publishState || 'draft'}`} color={publishState === 'published' ? 'success' : 'default'} />
                                </Box>

                                <TextField
                                    label='Version'
                                    value={version}
                                    onChange={(event) => setVersion(event.target.value)}
                                    placeholder='2.9.5'
                                    error={version.trim() !== '' && !isVersionAllowed}
                                    helperText={version.trim() !== '' && !isVersionAllowed
                                        ? `Must be greater than ${baselineVersion}`
                                        : requiresVersionProgression
                                            ? 'Use semantic versioning (major.minor.patch).'
                                            : 'Editing existing version is allowed.'}
                                    fullWidth
                                />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id='release-note-notes-format'>Notes Storage</InputLabel>
                                            <Select
                                                labelId='release-note-notes-format'
                                                value={notesFormat}
                                                label='Notes Storage'
                                                onChange={(event) => setNotesFormat(event.target.value)}
                                            >
                                                <MenuItem value='md'>md</MenuItem>
                                                <MenuItem value='json'>json</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id='release-note-icon-ref'>Icon</InputLabel>
                                            <Select
                                                labelId='release-note-icon-ref'
                                                value={iconRef}
                                                label='Icon'
                                                onChange={(event) => setIconRef(event.target.value)}
                                            >
                                                <MenuItem value=''>No icon</MenuItem>
                                                {imageRefs.map((item) => (
                                                    <MenuItem key={item} value={item}>{item}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <TextField
                                    label='Content'
                                    multiline
                                    minRows={24}
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    helperText='Markdown/source text. Uploaded images insert markdown syntax.'
                                    sx={{ '& .MuiInputBase-inputMultiline': { minHeight: '55vh !important' } }}
                                    fullWidth
                                />

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                                    <Button className='admin-action-button' variant='outlined' component='label'>
                                        Upload Image
                                        <input type='file' hidden accept='image/*' onChange={(event) => uploadImage(event.target.files?.[0])} />
                                    </Button>
                                    <Button className='admin-action-button' variant='outlined' onClick={() => setPublishedState('draft')} disabled={selectedID === 'new' || saving}>Move To Draft</Button>
                                    <Button className='admin-action-button' variant='contained' onClick={() => setPublishedState('published')} disabled={selectedID === 'new' || saving || !isVersionProgressed}>Publish</Button>
                                </Stack>
                                {iconRef ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant='subtitle2'>Selected Icon:</Typography>
                                        <img
                                            src={iconRef.startsWith('http') ? iconRef : `/image${iconRef}`}
                                            alt='selected-release-note-icon'
                                            style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: '1px solid #ddd' }}
                                        />
                                    </Box>
                                ) : null}

                                {imageRefs.length > 0 ? (
                                    <Stack spacing={0.5}>
                                        <Typography variant='subtitle2'>Image References</Typography>
                                        {imageRefs.map((item) => (
                                            <Typography key={item} variant='caption' sx={{ wordBreak: 'break-all' }}>{item}</Typography>
                                        ))}
                                    </Stack>
                                ) : null}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </AdminPageShell>
    )
}

export default connect((state) => ({
    jwt: state.auth.jwt,
}))(ReleaseNotesManage)
