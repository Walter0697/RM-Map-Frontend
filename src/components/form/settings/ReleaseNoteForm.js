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

import actions from '../../../store/actions'
import graphql from '../../../graphql'

import dayjs from 'dayjs'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function ReleaseNoteItem({
    open,
    handleClose,
    version,
}) {
    const [ releaseNotes, setNotes ] = useState([])
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
            setNotes(JSON.parse(releaseData.specificreleasenote.notes))
        }

        if (releaseError) {
            console.log(releaseError)
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
                        {releaseNotes.map((note, index) => {
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
                        })}
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
    const [ latestReleaseNotes, setLatest ] = useState([])

    const [ selectedVersion, setVersion ] = useState(null)

    const previousList = useMemo(() => {
        let output = []
        list.forEach(s => {
            output.unshift(s)
        })
        return output.filter(s => s.version !== latest.version)
    }, [list, latest])

    useEffect(() => {
        if (latest?.notes) {
            setLatest(JSON.parse(latest.notes))
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
                                    Ver. {latest.version}{latest.icon && (
                                        <><span>.</span><VersionIcon icon='valentine' sx={{ fontSize: '20px' }}/></>
                                    )}
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
                                {latestReleaseNotes.map((note, index) => {
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
                                })}
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
                                ver. {release.version}{release.icon && (
                                    <>
                                        <span>.</span><VersionIcon icon={release.icon} sx={{ fontSize: '15px' }}/>
                                    </>
                                )}
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