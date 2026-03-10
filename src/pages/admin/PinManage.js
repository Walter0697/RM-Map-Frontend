import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Stack,
    Typography,
} from '@mui/material'
import { useHistory } from 'react-router-dom'
import backend from '../../constant/backend'

import { useQuery, useLazyQuery, useMutation } from '@apollo/client'

import useBoop from '../../hooks/useBoop'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import AdminPageShell from '../../components/admin/AdminPageShell'
import PinForm from '../../components/form/admin/PinForm'

import graphql from '../../graphql'
import { generatePinSamplePreview } from '../../scripts/generate/pinSamplePreview'

const PREVIEW_TILE_COUNT = 3

const createPendingTiles = () => (
    Array.from({ length: PREVIEW_TILE_COUNT }, (_, index) => ({
        id: `pending-${index}`,
        status: 'pending',
        src: '',
        label: '',
    }))
)

const getSampleTypesForPin = (typeList, pinId) => {
    if (!typeList.length) return []
    const sorted = [ ...typeList ].sort((a, b) => Number(a.id) - Number(b.id))
    const total = sorted.length
    const count = Math.min(PREVIEW_TILE_COUNT, total)
    const start = Math.abs(Number(pinId || 0)) % total
    return Array.from({ length: count }, (_, index) => sorted[(start + index) % total])
}

function PinManage({ jwt }) {
    const history = useHistory()
    // graphql request
    const { data: typeData, loading: typeLoading, error: typeError } = useQuery(graphql.markertypes.list, { fetchPolicy: 'no-cache' })
    const [ listPinGQL, { data: pinData, loading: pinLoading, error: pinError } ] = useLazyQuery(graphql.pins.list, { fetchPolicy: 'no-cache' })
    const [ removePinGQL, { data: removeData, loading: removeLoading, error: removeError } ] = useMutation(graphql.pins.remove, { errorPolicy: 'all' })

    // marker type information for selection
    const [ typeList, setTypeList ] = useState([])

    const [ pinList, setList ] = useState([])
    const [ pinPreviewMap, setPinPreviewMap ] = useState({})
    const [ pinGroupList, setPinGroupList ] = useState([])

    const [ createFormOpen, setFormOpen ] = useState(false)
    const [ selectedPin, setSelected ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createMessage, setMessage ] = useState('')

    useEffect(() => {
        listPinGQL()
    }, [])

    useEffect(() => {
        const loadPinGroups = async () => {
            try {
                if (!jwt) return

                const response = await fetch(backend.withBasePath('admin/pin-groups'), {
                    method: 'GET',
                    headers: {
                        Authorization: jwt,
                    },
                })
                if (!response.ok) return
                const data = await response.json()
                setPinGroupList(Array.isArray(data) ? data : [])
            } catch (error) {
                setPinGroupList([])
            }
        }
        loadPinGroups()
    }, [createAlert, jwt])

    useEffect(() => {
        if (pinData) {
            const sorted = [ ...(pinData.pins || []) ].sort((a, b) => {
                const aTime = new Date(a.created_at || 0).getTime()
                const bTime = new Date(b.created_at || 0).getTime()
                return bTime - aTime
            })
            setList(sorted)
        }

    }, [pinData, pinError])

    useEffect(() => {
        if (removeData) {
            listPinGQL()
        }

        if (removeError) {
            listPinGQL()
        }
    }, [removeData, removeError])

    useEffect(() => {
        if (typeData) {
            setTypeList(typeData.markertypes)
        }

    }, [typeData, typeError])

    useEffect(() => {
        let canceled = false

        if (!pinList.length || !typeList.length) {
            setPinPreviewMap({})
            return
        }

        setPinPreviewMap(() => {
            const initial = {}
            pinList.forEach((pin) => {
                initial[pin.id] = {
                    status: 'pending',
                    tiles: createPendingTiles(),
                }
            })
            return initial
        })

        const generate = async () => {
            for (const pin of pinList) {
                const sampleTypes = getSampleTypesForPin(typeList, pin.id)
                const tiles = await Promise.all(sampleTypes.map(async (sampleType) => {
                    const iconPath = sampleType?.icon_path || ''
                    const iconSrc = /^https?:\/\//i.test(iconPath) ? iconPath : `${backend.IMAGE_LINK}${iconPath}`
                    const pinSourcePath = pin.display_path || pin.image_path
                    const pinImageSrc = `${backend.IMAGE_LINK}${pinSourcePath}`

                    try {
                        const src = await generatePinSamplePreview({
                            pinImageSrc,
                            iconSrc,
                            pin,
                        })
                        return {
                            id: `${pin.id}-${sampleType.id}`,
                            status: 'ready',
                            src,
                            label: sampleType.label,
                        }
                    } catch (error) {
                        return {
                            id: `${pin.id}-${sampleType.id}`,
                            status: 'failed',
                            src: '',
                            label: sampleType.label,
                        }
                    }
                }))

                const completedTiles = [ ...tiles ]
                while (completedTiles.length < PREVIEW_TILE_COUNT) {
                    completedTiles.push({
                        id: `${pin.id}-empty-${completedTiles.length}`,
                        status: 'failed',
                        src: '',
                        label: '',
                    })
                }

                const status = completedTiles.some((tile) => tile.status === 'ready') ? 'complete' : 'failed'

                if (canceled) return
                setPinPreviewMap((prev) => ({
                    ...prev,
                    [pin.id]: {
                        status,
                        tiles: completedTiles,
                    },
                }))
            }
        }

        generate()

        return () => {
            canceled = true
        }
    }, [pinList, typeList])

    const onCreateFormOpen = () => {
        setSelected(null)
        setFormOpen(true)
    }

    const onUpdateFormOpen = (item) => {
        setSelected(item)
        setFormOpen(true)
    }

    const onRemoveButtonClick = (item) => {
        if (!window.confirm(`confirm to delete ${item.label}?`)) return
        removePinGQL({ variables: { id: item.id }})
    }

    const onTypeCreated = () => {
        setMessage('successfully created pin')
        setFormOpen(false)
        confirmCreated()
        listPinGQL()
    }

    const onTypeUpdated = () => {
        setMessage('successfully updated pin')
        setFormOpen(false)
        confirmCreated()
        listPinGQL()
    }
    
    return (
        <AdminPageShell
            title='Pin Manage'
            description='Manage pin images, map bounds, and display behavior.'
            alertOpen={createAlert}
            alertMessage={createMessage}
            actions={(
                <Stack direction='row' spacing={1}>
                    <Button
                        className='admin-action-button'
                        variant='outlined'
                        onClick={() => history.push('/admin/pin-groups')}
                    >
                        Manage Groups
                    </Button>
                    <Button
                        className='admin-action-button'
                        variant='contained'
                        startIcon={<AddCircleIcon />}
                        onClick={onCreateFormOpen}
                    >
                        Add New
                    </Button>
                </Stack>
            )}
        >
            <Stack spacing={1.5}>
                {pinList.map((item, index) => (
                    <Card
                        key={index}
                        className='admin-panel'
                        sx={{ backgroundColor: '#eef8ff' }}
                    >
                        <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '120px minmax(0, 1fr) 110px' },
                                    gap: 1,
                                    alignItems: 'center',
                                }}
                            >
                                <Box sx={{ minHeight: 72, display: 'flex', alignItems: 'center' }}>
                                    <img
                                        src={backend.IMAGE_LINK + item.image_path}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: 70,
                                            width: 'auto',
                                            height: 'auto',
                                            display: 'block',
                                        }}
                                    />
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                                        {item.label}
                                    </Typography>
                                    <Typography
                                        variant='body1'
                                        sx={{
                                            fontWeight: 700,
                                            color: 'primary.main',
                                            mt: 0.25,
                                        }}
                                    >
                                        Group: {Array.isArray(item.group_names) && item.group_names.length ? item.group_names[0] : 'Ungrouped'}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.75 }}>
                                            Sample previews
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                                gap: 0.75,
                                                maxWidth: 240,
                                            }}
                                        >
                                            {(pinPreviewMap[item.id]?.tiles || createPendingTiles()).map((tile, tileIndex) => (
                                                <Box
                                                    key={tile.id || `${item.id}-${tileIndex}`}
                                                    data-testid={`pin-preview-tile-${item.id}-${tileIndex}`}
                                                    sx={{
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderRadius: 1,
                                                        minHeight: 52,
                                                        backgroundColor: '#fff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden',
                                                        px: 0.5,
                                                    }}
                                                >
                                                    {tile.status === 'ready' && tile.src ? (
                                                        <img
                                                            src={tile.src}
                                                            alt={`${item.label} sample preview ${tileIndex + 1}`}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                display: 'block',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant='caption' color='text.secondary'>
                                                            {tile.status === 'failed' ? 'Failed' : 'Generating...'}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                    <Stack
                                        direction='row'
                                        justifyContent='flex-end'
                                    >
                                        <IconButton
                                            className='admin-icon-button'
                                            onClick={() => onUpdateFormOpen(item)}
                                            aria-label={`edit ${item.label}`}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            className='admin-icon-button'
                                            onClick={() => onRemoveButtonClick(item)}
                                            aria-label={`delete ${item.label}`}
                                        >
                                            <DeleteIcon sx={{ color: 'error.main' }} />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
            <PinForm
                open={createFormOpen}
                handleClose={() => setFormOpen(false)}
                onCreated={onTypeCreated}
                onUpdated={onTypeUpdated}
                typeList={typeList}
                pin={selectedPin}
                pinGroups={pinGroupList}
            />
        </AdminPageShell>
    )
}

export default connect((state) => ({
    jwt: state.auth.jwt,
}))(PinManage)
