import React, { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'
import {
    Autocomplete,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import TitleIcon from '@mui/icons-material/Title'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import LinkIcon from '@mui/icons-material/Link'
import ImageIcon from '@mui/icons-material/Image'

import backend from '../../constant/backend'
import AdminPageShell from '../../components/admin/AdminPageShell'
import appPackage from '../../../package.json'
import VersionIcon, { RELEASE_NOTE_ICON_OPTIONS } from '../../components/wrapper/VersionIcon'

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

function parseJsonContentLines(input) {
    const raw = `${input || ''}`.trim()
    if (!raw) return ['']
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            const lines = parsed.map((item) => `${item ?? ''}`.trim()).filter((item) => item !== '')
            return lines.length > 0 ? lines : ['']
        }
    } catch (error) {
        // fallback below
    }
    const fallback = raw
        .split(/\r?\n/)
        .map((line) => line.trim().replace(/^-+\s*/, ''))
        .filter((line) => line !== '')
    return fallback.length > 0 ? fallback : ['']
}

function escapeHTML(input) {
    return `${input || ''}`
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

function sanitizePreviewURL(input) {
    const value = `${input || ''}`.trim()
    if (!value) return ''
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value
    return ''
}

function inlineMarkdownToHTML(input) {
    const source = `${input || ''}`
    const tokenPattern = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g
    let cursor = 0
    let output = ''
    let match = tokenPattern.exec(source)
    while (match) {
        const token = match[0]
        output += escapeHTML(source.slice(cursor, match.index))
        if (token.startsWith('![')) {
            const imageMatch = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
            const alt = escapeHTML(imageMatch?.[1] || '')
            const src = sanitizePreviewURL(imageMatch?.[2] || '')
            output += src ? `<img src="${escapeHTML(src)}" alt="${alt}" style="max-width:100%;height:auto;border-radius:8px;" />` : escapeHTML(token)
        } else if (token.startsWith('[')) {
            const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
            const label = escapeHTML(linkMatch?.[1] || '')
            const href = sanitizePreviewURL(linkMatch?.[2] || '')
            output += href ? `<a href="${escapeHTML(href)}" target="_blank" rel="noreferrer noopener">${label}</a>` : escapeHTML(token)
        } else if (token.startsWith('**') && token.endsWith('**')) {
            output += `<strong>${escapeHTML(token.slice(2, -2))}</strong>`
        } else if (token.startsWith('*') && token.endsWith('*')) {
            output += `<em>${escapeHTML(token.slice(1, -1))}</em>`
        } else {
            output += escapeHTML(token)
        }
        cursor = match.index + token.length
        match = tokenPattern.exec(source)
    }
    output += escapeHTML(source.slice(cursor))
    return output
}

function markdownPreviewToHTML(markdown) {
    const lines = `${markdown || ''}`.split(/\r?\n/)
    if (lines.length === 0) return ''
    let output = ''
    let inList = false
    for (const rawLine of lines) {
        const line = `${rawLine || ''}`.trim()
        if (!line) {
            if (inList) {
                output += '</ul>'
                inList = false
            }
            continue
        }
        if (line.startsWith('- ')) {
            if (!inList) {
                output += '<ul>'
                inList = true
            }
            output += `<li>${inlineMarkdownToHTML(line.slice(2))}</li>`
            continue
        }
        if (inList) {
            output += '</ul>'
            inList = false
        }
        if (line.startsWith('## ')) {
            output += `<h3>${inlineMarkdownToHTML(line.slice(3))}</h3>`
            continue
        }
        output += `<p>${inlineMarkdownToHTML(line)}</p>`
    }
    if (inList) output += '</ul>'
    return output
}

function ReleaseNotesManage({ jwt }) {
    const baselineVersion = useMemo(() => normalizeSemver(appPackage.version || ''), [])
    const [items, setItems] = useState([])
    const [selectedID, setSelectedID] = useState('new')
    const [selectedVersion, setSelectedVersion] = useState('')
    const [version, setVersion] = useState(baselineVersion || '')
    const [content, setContent] = useState('')
    const [notesFormat, setNotesFormat] = useState('md')
    const [jsonLines, setJsonLines] = useState([''])
    const [publishState, setPublishState] = useState('draft')
    const [imageRefs, setImageRefs] = useState([])
    const [iconRef, setIconRef] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const mdEditorRef = useRef(null)

    const isExistingNote = selectedID !== 'new'
    const normalizedVersion = normalizeSemver(version)
    const normalizedSelectedVersion = normalizeSemver(selectedVersion)
    const isVersionValid = normalizedVersion !== ''
    const versionChanged = isExistingNote && normalizedSelectedVersion !== '' && normalizedVersion !== normalizedSelectedVersion
    const isVersionProgressed = isVersionValid && compareSemver(version, baselineVersion) > 0
    const isVersionAllowed = isVersionValid && (
        isExistingNote
            ? (!versionChanged || compareSemver(version, baselineVersion) >= 0)
            : compareSemver(version, baselineVersion) === 0
    )

    const resetForm = () => {
        setSelectedID('new')
        setSelectedVersion('')
        setVersion(baselineVersion || '')
        setContent('')
        setNotesFormat('md')
        setJsonLines([''])
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
        setJsonLines(parseJsonContentLines(item.content || ''))
        setPublishState(item.publish_state || 'draft')
        setImageRefs(Array.isArray(item.image_refs) ? item.image_refs : [])
        const iconKey = `${item.icon_ref || ''}`.trim()
        setIconRef(RELEASE_NOTE_ICON_OPTIONS.some((option) => option.key === iconKey) ? iconKey : '')
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

    const applyMarkdown = (prefix, suffix = '') => {
        const editor = mdEditorRef.current
        if (!editor) return
        const start = editor.selectionStart || 0
        const end = editor.selectionEnd || 0
        const selected = content.slice(start, end)
        const replacement = `${prefix}${selected || 'text'}${suffix}`
        const nextValue = `${content.slice(0, start)}${replacement}${content.slice(end)}`
        setContent(nextValue)
        window.requestAnimationFrame(() => {
            editor.focus()
            const cursor = start + replacement.length
            editor.setSelectionRange(cursor, cursor)
        })
    }

    const applyMarkdownList = () => {
        const editor = mdEditorRef.current
        if (!editor) return
        const start = editor.selectionStart || 0
        const end = editor.selectionEnd || 0
        const selected = content.slice(start, end) || 'item'
        const withBullets = selected
            .split('\n')
            .map((line) => {
                const value = line.trim()
                if (!value) return '- '
                return value.startsWith('- ') ? value : `- ${value}`
            })
            .join('\n')
        const nextValue = `${content.slice(0, start)}${withBullets}${content.slice(end)}`
        setContent(nextValue)
        window.requestAnimationFrame(() => {
            editor.focus()
            const cursor = start + withBullets.length
            editor.setSelectionRange(cursor, cursor)
        })
    }

    const submit = async () => {
        if (!jwt) return
        const mdContent = content.trim()
        const normalizedJsonLines = jsonLines.map((item) => `${item || ''}`.trim()).filter((item) => item !== '')
        const contentPayload = notesFormat === 'json'
            ? JSON.stringify(normalizedJsonLines)
            : mdContent

        if (!version.trim() || !contentPayload.trim()) {
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
                    content: contentPayload,
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

    const togglePublishedStateForItem = async (item, event) => {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }
        if (!jwt || saving) return
        const id = `${item?.id || ''}`.trim()
        if (!id) return
        const currentState = `${item.publish_state || 'draft'}`.toLowerCase()
        const nextState = currentState === 'published' ? 'draft' : 'published'
        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')
        try {
            const response = await fetch(backend.withBasePath(`admin/release-notes/${id}/${nextState === 'published' ? 'publish' : 'unpublish'}`), {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                },
            })
            if (!response.ok) throw new Error(await parseResponseError(response))
            const payload = await response.json()
            setSuccessMessage(nextState === 'published' ? 'Release note published.' : 'Release note moved to draft.')
            await load()
            if (`${selectedID}` === id) {
                applyItem(payload)
            }
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
            const markdownImage = `![release-note-image](${payload.url || `/image${path}`})`
            if (notesFormat === 'json') {
                setJsonLines((previous) => [...previous.filter((item) => `${item || ''}`.trim() !== ''), markdownImage])
            } else {
                const editor = mdEditorRef.current
                if (!editor) {
                    setContent((previous) => `${previous}${previous ? '\n' : ''}${markdownImage}`)
                } else {
                    const start = editor.selectionStart || 0
                    const end = editor.selectionEnd || 0
                    const prefix = content.slice(0, start)
                    const suffix = content.slice(end)
                    const needsLeadingBreak = prefix.length > 0 && !prefix.endsWith('\n')
                    const needsTrailingBreak = suffix.length > 0 && !suffix.startsWith('\n')
                    const inserted = `${needsLeadingBreak ? '\n' : ''}${markdownImage}${needsTrailingBreak ? '\n' : ''}`
                    const nextValue = `${prefix}${inserted}${suffix}`
                    setContent(nextValue)
                    window.requestAnimationFrame(() => {
                        editor.focus()
                        const cursor = prefix.length + inserted.length
                        editor.setSelectionRange(cursor, cursor)
                    })
                }
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
                    <Button className='admin-action-button' variant='contained' onClick={submit} disabled={loading || saving}>Save</Button>
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
                                            <span>{item.version}</span>
                                            {item.icon_ref ? <VersionIcon icon={item.icon_ref} sx={{ fontSize: 18 }} /> : null}
                                        </span>
                                        <span style={{ display: 'flex', gap: 6 }}>
                                            <Chip size='small' label={item.notes_format || 'md'} />
                                            <Chip
                                                size='small'
                                                label={item.publish_state || 'draft'}
                                                color={item.publish_state === 'published' ? 'success' : 'default'}
                                                onClick={(event) => togglePublishedStateForItem(item, event)}
                                                disabled={saving}
                                            />
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
                                    disabled={!isExistingNote}
                                    error={version.trim() !== '' && !isVersionAllowed}
                                    helperText={version.trim() !== '' && !isVersionAllowed
                                        ? isExistingNote
                                            ? `Must be equal to or greater than ${baselineVersion}`
                                            : `Must match current app version ${baselineVersion}`
                                        : isExistingNote
                                            ? 'Editing existing version is allowed.'
                                            : 'New draft uses the current app version.'}
                                    fullWidth
                                />

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: 2,
                                        width: '100%',
                                    }}
                                >
                                    <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                                        <TextField label='Notes Storage' value={notesFormat} fullWidth disabled />
                                    </Box>
                                    <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                                        <Autocomplete
                                            fullWidth
                                            options={RELEASE_NOTE_ICON_OPTIONS}
                                            value={RELEASE_NOTE_ICON_OPTIONS.find((item) => item.key === iconRef) || RELEASE_NOTE_ICON_OPTIONS[0]}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option.key === value.key}
                                            onChange={(_, option) => setIconRef(option?.key || '')}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label='Icon'
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <>
                                                                {iconRef ? (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                                                        <VersionIcon icon={iconRef} sx={{ fontSize: 20 }} />
                                                                    </Box>
                                                                ) : null}
                                                                {params.InputProps.startAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <li {...props} key={option.key || 'none'}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {option.key ? <VersionIcon icon={option.key} sx={{ fontSize: 20 }} /> : null}
                                                        <span>{option.label}</span>
                                                    </Box>
                                                </li>
                                            )}
                                        />
                                    </Box>
                                </Box>

                                {notesFormat === 'json' ? (
                                    <Stack spacing={1}>
                                        <Typography variant='subtitle2'>JSON Lines</Typography>
                                        {jsonLines.map((line, index) => (
                                            <Box key={`json-line-${index}`} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <TextField
                                                    label={`Line ${index + 1}`}
                                                    value={line}
                                                    onChange={(event) => setJsonLines((previous) => previous.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
                                                    fullWidth
                                                />
                                                <Button
                                                    className='admin-action-button'
                                                    variant='outlined'
                                                    onClick={() => setJsonLines((previous) => {
                                                        if (previous.length <= 1) return ['']
                                                        return previous.filter((_, itemIndex) => itemIndex !== index)
                                                    })}
                                                >
                                                    Remove
                                                </Button>
                                            </Box>
                                        ))}
                                        <Box>
                                            <Button
                                                className='admin-action-button'
                                                variant='outlined'
                                                onClick={() => setJsonLines((previous) => [...previous, ''])}
                                            >
                                                Add Line
                                            </Button>
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1}>
                                        <Typography variant='subtitle2'>Content (Rich Markdown Editor)</Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                            <Tooltip title='Bold'>
                                                <IconButton size='small' onClick={() => applyMarkdown('**', '**')}>
                                                    <FormatBoldIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title='Italic'>
                                                <IconButton size='small' onClick={() => applyMarkdown('*', '*')}>
                                                    <FormatItalicIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title='Heading'>
                                                <IconButton size='small' onClick={() => applyMarkdown('## ')}>
                                                    <TitleIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title='List'>
                                                <IconButton size='small' onClick={applyMarkdownList}>
                                                    <FormatListBulletedIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title='Link'>
                                                <IconButton size='small' onClick={() => applyMarkdown('[', '](https://example.com)')}>
                                                    <LinkIcon fontSize='small' />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title='Upload Image'>
                                                <IconButton size='small' component='label'>
                                                    <ImageIcon fontSize='small' />
                                                    <input type='file' hidden accept='image/*' onChange={(event) => uploadImage(event.target.files?.[0])} />
                                                </IconButton>
                                            </Tooltip>
                                            <Typography variant='caption' color='text.secondary' sx={{ alignSelf: 'center' }}>
                                                Markdown Toolbar
                                            </Typography>
                                        </Stack>
                                        <TextField
                                            label='Content'
                                            multiline
                                            minRows={10}
                                            value={content}
                                            inputRef={mdEditorRef}
                                            onChange={(event) => setContent(event.target.value)}
                                            helperText='Markdown content. Use toolbar buttons to format quickly.'
                                            fullWidth
                                        />
                                        <Box>
                                            <Typography variant='subtitle2'>Preview</Typography>
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    p: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1,
                                                    backgroundColor: 'background.paper',
                                                    '& p': { my: 1 },
                                                    '& h3': { mt: 1, mb: 1 },
                                                    '& ul': { mt: 1, mb: 1, pl: 3 },
                                                    '& img': { display: 'block', my: 1 },
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: markdownPreviewToHTML(content) || '<p style="opacity:0.6">Nothing to preview yet.</p>',
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                )}

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                                    <Button className='admin-action-button' variant='outlined' onClick={() => setPublishedState('draft')} disabled={selectedID === 'new' || saving}>Move To Draft</Button>
                                    <Button className='admin-action-button' variant='contained' onClick={() => setPublishedState('published')} disabled={selectedID === 'new' || saving}>Publish</Button>
                                </Stack>
                                {iconRef ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant='subtitle2'>Selected Icon:</Typography>
                                        <VersionIcon icon={iconRef} sx={{ fontSize: 24 }} />
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
