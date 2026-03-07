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

const CONTENT_FORMATS = ['markdown', 'html']

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
    const [title, setTitle] = useState('')
    const [version, setVersion] = useState('')
    const [content, setContent] = useState('')
    const [contentFormat, setContentFormat] = useState('markdown')
    const [publishState, setPublishState] = useState('draft')
    const [imageRefs, setImageRefs] = useState([])
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const isVersionValid = normalizeSemver(version) !== ''
    const isVersionProgressed = isVersionValid && compareSemver(version, baselineVersion) > 0
    const canPublish = publishState === 'published' ? isVersionProgressed : true

    const resetForm = () => {
        setSelectedID('new')
        setTitle('')
        setVersion('')
        setContent('')
        setContentFormat('markdown')
        setPublishState('draft')
        setImageRefs([])
    }

    const applyItem = (item) => {
        setSelectedID(`${item.id}`)
        setTitle(item.title || '')
        setVersion(item.version || '')
        setContent(item.content || '')
        setContentFormat(item.content_format || 'markdown')
        setPublishState(item.publish_state || 'draft')
        setImageRefs(Array.isArray(item.image_refs) ? item.image_refs : [])
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
        if (!title.trim() || !version.trim() || !content.trim()) {
            setErrorMessage('Title, version, and content are required.')
            return
        }
        if (!isVersionValid) {
            setErrorMessage('Version must be valid semantic version (for example 2.9.5).')
            return
        }
        if (!isVersionProgressed) {
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
                    title: title.trim(),
                    version: version.trim(),
                    content,
                    content_format: contentFormat,
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
            if (contentFormat === 'markdown') {
                setContent((previous) => `${previous}${previous ? '\n' : ''}![release-note-image](${payload.url || `/image${path}`})`)
            } else {
                setContent((previous) => `${previous}${previous ? '\n' : ''}<img src="${payload.url || `/image${path}`}" alt="release-note-image" />`)
            }
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

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
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
                                        <span>{item.version} - {item.title}</span>
                                        <Chip size='small' label={item.publish_state || 'draft'} color={item.publish_state === 'published' ? 'success' : 'default'} />
                                    </Button>
                                ))}
                                {items.length === 0 ? <Typography variant='body2' color='text.secondary'>No release notes yet.</Typography> : null}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card className='admin-panel'>
                        <CardContent>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip label={`App baseline: ${baselineVersion || 'unknown'}`} />
                                    <Chip label={isVersionProgressed ? 'Version OK' : 'Version blocked'} color={isVersionProgressed ? 'success' : 'warning'} />
                                </Box>

                                <TextField
                                    label='Title'
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder='Release title'
                                    fullWidth
                                />
                                <TextField
                                    label='Version'
                                    value={version}
                                    onChange={(event) => setVersion(event.target.value)}
                                    placeholder='2.9.5'
                                    error={version.trim() !== '' && !isVersionProgressed}
                                    helperText={version.trim() !== '' && !isVersionProgressed
                                        ? `Must be greater than ${baselineVersion}`
                                        : 'Use semantic versioning (major.minor.patch).'}
                                    fullWidth
                                />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id='release-note-format'>Content Format</InputLabel>
                                            <Select
                                                labelId='release-note-format'
                                                value={contentFormat}
                                                label='Content Format'
                                                onChange={(event) => setContentFormat(event.target.value)}
                                            >
                                                {CONTENT_FORMATS.map((format) => (
                                                    <MenuItem key={format} value={format}>{format}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id='release-note-state'>Publish State</InputLabel>
                                            <Select
                                                labelId='release-note-state'
                                                value={publishState}
                                                label='Publish State'
                                                onChange={(event) => setPublishState(event.target.value)}
                                            >
                                                <MenuItem value='draft'>draft</MenuItem>
                                                <MenuItem value='published'>published</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <TextField
                                    label='Content'
                                    multiline
                                    minRows={8}
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    helperText={contentFormat === 'markdown'
                                        ? 'Markdown source. Uploaded images insert markdown syntax.'
                                        : 'HTML source. Uploaded images insert <img> tags.'}
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
                </Grid>
            </Grid>
        </AdminPageShell>
    )
}

export default connect((state) => ({
    jwt: state.auth.jwt,
}))(ReleaseNotesManage)
