import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery } from '@apollo/client'
import { 
    Grid,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Slide,
} from '@mui/material'

import VersionIcon from '../../wrapper/VersionIcon'
import backend from '../../../constant/backend'

import actions from '../../../store/actions'
import graphql from '../../../graphql'

import dayjs from 'dayjs'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

const parseReleaseNotes = (rawValue) => {
    const raw = `${rawValue ?? ''}`.trim()
    if (!raw) return []
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            return parsed.map((item) => `${item ?? ''}`.trim()).filter((item) => item !== '')
        }
    } catch (error) {
        // fallback below
    }

    return raw
        .split(/\r?\n/)
        .map((line) => line.trim().replace(/^-+\s*/, ''))
        .filter((line) => line !== '')
}

const escapeHTML = (input) => {
    return `${input || ''}`
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll('\'', '&#39;')
}

const sanitizePreviewURL = (input) => {
    const value = `${input || ''}`.trim()
    if (!value) return ''
    const imageBase = `${backend.IMAGE_LINK || '/image'}`.replace(/\/+$/, '')
    if (value.startsWith('http://') || value.startsWith('https://')) return value
    if (value.startsWith('/image/')) return `${imageBase}/${value.replace(/^\/image\/+/, '')}`
    if (value.startsWith('image/')) return `${imageBase}/${value.replace(/^image\/+/, '')}`
    if (value.startsWith('/release_notes/')) return `${imageBase}${value}`
    if (value.startsWith('release_notes/')) return `${imageBase}/${value}`
    if (value.startsWith('/')) return value
    return ''
}

const inlineMarkdownToHTML = (input) => {
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
            output += src ? `<img src='${escapeHTML(src)}' alt='${alt}' style='max-width:100%;height:auto;border-radius:8px;' />` : escapeHTML(token)
        } else if (token.startsWith('[')) {
            const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
            const label = escapeHTML(linkMatch?.[1] || '')
            const href = sanitizePreviewURL(linkMatch?.[2] || '')
            output += href ? `<a href='${escapeHTML(href)}' target='_blank' rel='noreferrer noopener'>${label}</a>` : escapeHTML(token)
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

const markdownToHTML = (markdown) => {
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

const parseReleaseContent = (rawValue) => {
    const raw = `${rawValue ?? ''}`.trim()
    if (!raw) return { mode: 'list', items: [] }
    try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
            return {
                mode: 'list',
                items: parsed.map((item) => `${item ?? ''}`.trim()).filter((item) => item !== ''),
            }
        }
    } catch (error) {
        // markdown fallback below
    }
    return { mode: 'markdown', html: markdownToHTML(raw) }
}

const normalizeSemver = (input) => {
    const value = `${input || ''}`.trim().toLowerCase().replace(/^v/, '')
    if (!value) return ''
    const noBuild = value.split('+')[0]
    const main = noBuild.split('-')[0]
    const segments = main.split('.')
    if (segments.length < 3 || segments.slice(0, 3).some((item) => !/^\d+$/.test(item))) return ''
    return noBuild
}

const compareSemver = (a, b) => {
    const normalizeParts = (value) => {
        const normalized = normalizeSemver(value)
        const [main, pre = ''] = normalized.split('-', 2)
        const numbers = main.split('.').slice(0, 3).map((item) => Number(item))
        return { normalized, numbers, pre }
    }

    const left = normalizeParts(a)
    const right = normalizeParts(b)
    if (!left.normalized && !right.normalized) {
        return `${a || ''}`.localeCompare(`${b || ''}`)
    }
    if (!left.normalized) return -1
    if (!right.normalized) return 1

    for (let index = 0; index < 3; index += 1) {
        if (left.numbers[index] > right.numbers[index]) return 1
        if (left.numbers[index] < right.numbers[index]) return -1
    }

    if (!left.pre && !right.pre) return 0
    if (!left.pre) return 1
    if (!right.pre) return -1
    return left.pre.localeCompare(right.pre)
}

function ReleaseNoteItem({
    open,
    handleClose,
    version,
}) {
    const [ releaseNotes, setNotes ] = useState({ mode: 'list', items: [] })
    const [ releaseDate, setDate ] = useState('')
    const [ specificReleaseNoteGQL, { data: releaseData, loading: releaseLoading, error: releaseError } ] = useLazyQuery(graphql.releasenotes.find, { fetchPolicy: 'no-cache' })

    useEffect(() => {
        if (open && version) {
            specificReleaseNoteGQL({ variables: { version } })
        }
    }, [version, open])

    useEffect(() => {
        if (releaseData) {
            setDate(releaseData.specificreleasenote.date)
            setNotes(parseReleaseContent(releaseData.specificreleasenote.notes))
        }

    }, [releaseData, releaseError])

    return (
        <Dialog
            fullWidth
            maxWidth={'lg'}
            open={open}
            onClose={handleClose}
            scroll={'paper'}
            TransitionComponent={TransitionUp}
        >
            <DialogTitle>
                Ver {version}
            </DialogTitle>
            <DialogContent dividers>
                {releaseLoading ? (
                    <div>...loading</div> 
                ) : (
                    <Grid 
                        container 
                        fullWidth
                    >
                        <Grid item xs={12} md={12} lg={12}
                            style={{
                                width: '100%',
                                fontSize: '15px',
                                color: 'gray',
                            }}
                        >
                            {dayjs(releaseDate).format('YYYY-MM-DD')}
                        </Grid>
                        {releaseNotes.mode === 'markdown' ? (
                            <Grid item xs={12} md={12} lg={12}
                                style={{ width: '100%', fontSize: '15px' }}
                                dangerouslySetInnerHTML={{ __html: releaseNotes.html || '<p style=\'opacity:0.6\'>No content</p>' }}
                            />
                        ) : (
                            releaseNotes.items.map((note, index) => {
                                if (note.startsWith('[b]')) {
                                    return (
                                        <Grid item key={'n' + index} xs={12} md={12} lg={12}
                                            style={{
                                                width: '100%',
                                                fontWeight: '700',
                                                fontSize: '18px',
                                                marginBottom: '5px',
                                                marginTop: '10px',
                                            }}
                                        >
                                            {note.replace('[b]', '')}
                                        </Grid>   
                                    ) 
                                }
                                return (
                                    <Grid item key={'n' + index} xs={12} md={12} lg={12}
                                        style={{
                                            width: '100%',
                                            fontSize: '15px',
                                        }}
                                    >
                                        - {note}
                                    </Grid>   
                                )
                            })
                        )}
                    </Grid>
                )   
                }
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={handleClose}
                >   
                    close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

function ReleaseNoteForm({
    open,
    handleClose,
    list,
    seen,
    latest,
    dispatch,
}) {
    const [ isSeen, setSeen ] = useState(false)
    const [ latestReleaseNotes, setLatest ] = useState({ mode: 'list', items: [] })

    const [ selectedVersion, setVersion ] = useState(null)

    const previousList = useMemo(() => {
        return [...list]
            .filter((s) => s.version !== latest.version)
            .sort((a, b) => compareSemver(b.version, a.version))
    }, [list, latest])

    useEffect(() => {
        if (latest?.notes) {
            setLatest(parseReleaseContent(latest.notes))
        }
        if (open) {
            if (latest.version !== seen) {
                setSeen(false)
                dispatch(actions.updateReleaseSeen(latest.version))
            } else {
                setSeen(true)
            }
        }
    }, [open])

    return (
        <>
            <Dialog
                fullWidth
                maxWidth={'lg'}
                open={open}
                onClose={handleClose}
                scroll={'paper'}
                TransitionComponent={TransitionUp}
            >
                <DialogTitle>
                    Release Notes
                </DialogTitle>
                <DialogContent dividers>
                    <Grid 
                        container 
                        fullWidth
                        style={{
                            border: isSeen ? 'solid #bdbdbd' : 'solid #cbcb1e',
                            backgroundColor: isSeen ? '#f9f9f9' : '#fbffd5',
                            padding: '15px',
                            borderRadius: '10px',
                        }}
                    >
                        {latest && (
                            <>
                                <Grid item xs={12} md={12} lg={12}
                                    style={{
                                        width: '100%',
                                        fontWeight: 'bold',
                                        fontSize: '25px',
                                    }}
                                >
                                    Ver. {latest.version}
                                    {latest.icon ? <><span> </span><VersionIcon icon={latest.icon} sx={{ fontSize: '20px' }}/></> : null}
                                </Grid>
                                <Grid item xs={12} md={12} lg={12}
                                    style={{
                                        width: '100%',
                                        fontSize: '15px',
                                        color: 'gray',
                                    }}
                                >
                                    {dayjs(latest.date).format('YYYY-MM-DD')}
                                </Grid>
                                <Grid item xs={12} md={12} lg={12} style={{ marginTop: '10px' }}></Grid>
                                {latestReleaseNotes.mode === 'markdown' ? (
                                    <Grid item xs={12} md={12} lg={12}
                                        style={{ width: '100%', fontSize: '15px' }}
                                        dangerouslySetInnerHTML={{ __html: latestReleaseNotes.html || '<p style=\'opacity:0.6\'>No content</p>' }}
                                    />
                                ) : (
                                    latestReleaseNotes.items.map((note, index) => {
                                        if (note.startsWith('[b]')) {
                                            return (
                                                <Grid item key={'n' + index} xs={12} md={12} lg={12}
                                                    style={{
                                                        width: '100%',
                                                        fontWeight: '700',
                                                        fontSize: '18px',
                                                        marginBottom: '5px',
                                                        marginTop: '10px',
                                                    }}
                                                >
                                                    {note.replace('[b]', '')}
                                                </Grid>   
                                            ) 
                                        }
                                        return (
                                            <Grid item key={'n' + index} xs={12} md={12} lg={12}
                                                style={{
                                                    width: '100%',
                                                    fontSize: '15px',
                                                }}
                                            >
                                                - {note}
                                            </Grid>   
                                        )
                                    })
                                )}
                            </>
                        )}
                    </Grid>
                    <Grid 
                        container
                        fullWidth
                        style={{
                            marginTop: '20px',
                        }}
                    >
                        {previousList.map((release, index) => (
                            <Grid item key={'l' + index} xs={12} md={12} lg={12}
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    border: 'solid #bdbdbd',
                                    backgroundColor: '#f9f9f9',
                                    padding: '15px',
                                    fontWeight: '700',
                                    marginTop: '15px',
                                }}
                                onClick={() => setVersion(release.version)}
                            >
                                ver. {release.version}
                                {release.icon ? <><span> </span><VersionIcon icon={release.icon} sx={{ fontSize: '15px' }}/></> : null}
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>
            <ReleaseNoteItem 
                open={!!selectedVersion}
                handleClose={() => setVersion(null)}
                version={selectedVersion}
            />
        </>
    )
}

export default connect(state => ({
    list: state.release.list,
    seen: state.release.seen,
    latest: state.release.latest,
})) (ReleaseNoteForm)
