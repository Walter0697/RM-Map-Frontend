import React, { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import SaveIcon from '@mui/icons-material/Save'
import UndoIcon from '@mui/icons-material/Undo'
import DeleteIcon from '@mui/icons-material/Delete'

import useBoop from '../../hooks/useBoop'
import backend from '../../constant/backend'
import AdminPageShell from '../../components/admin/AdminPageShell'
import MTRImage from '../../images/station/hkmtr2.jpeg'

const defaultDimension = {
    width: 2000,
    height: 1322,
}

function TrainStationManage({ jwt }) {
    const history = useHistory()
    const { mapName: routeMapName } = useParams()

    const [ maps, setMaps ] = useState([])
    const [ stations, setStations ] = useState([])
    const [ mapAsset, setMapAsset ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ errorMessage, setErrorMessage ] = useState('')

    const [ selectedStation, setSelectedStation ] = useState(null)
    const [ stationDraft, setStationDraft ] = useState(null)
    const [ originalDraft, setOriginalDraft ] = useState(null)
    const [ lineDraft, setLineDraft ] = useState([])
    const [ dragging, setDragging ] = useState(false)

    const [ mapForm, setMapForm ] = useState({
        map_name: '',
    })

    const [ alertOpen, triggerAlert ] = useBoop(2500)
    const [ alertMessage, setAlertMessage ] = useState('')

    const imageRef = useRef(null)
    const uploadRef = useRef(null)
    const [ imageMetric, setImageMetric ] = useState({
        naturalWidth: defaultDimension.width,
        naturalHeight: defaultDimension.height,
        displayWidth: defaultDimension.width,
        displayHeight: defaultDimension.height,
    })

    const currentMap = useMemo(() => (routeMapName ? decodeURIComponent(routeMapName) : ''), [routeMapName])

    const currentMapMeta = useMemo(() => {
        return maps.find((item) => item.map_name === currentMap) || null
    }, [maps, currentMap])

    const mapImageLink = useMemo(() => {
        if (mapAsset?.image_path) {
            return `${backend.IMAGE_LINK}${mapAsset.image_path}`
        }
        return MTRImage
    }, [mapAsset])

    const parseError = async (resp) => {
        const text = await resp.text()
        if (!text) return `${resp.status} ${resp.statusText}`
        return text
    }

    const authorizedFetch = async (path, options = {}) => {
        const headers = {
            ...(options.headers || {}),
            Authorization: jwt || '',
        }
        return fetch(backend.withBasePath(path), {
            ...options,
            headers,
        })
    }

    const refreshImageMetric = () => {
        const image = imageRef.current
        if (!image) return
        setImageMetric({
            naturalWidth: image.naturalWidth || defaultDimension.width,
            naturalHeight: image.naturalHeight || defaultDimension.height,
            displayWidth: image.clientWidth || defaultDimension.width,
            displayHeight: image.clientHeight || defaultDimension.height,
        })
    }

    const loadMaps = async () => {
        if (!jwt) return
        const resp = await authorizedFetch('admin/train-station-maps')
        if (!resp.ok) {
            throw new Error(`Failed to load maps: ${await parseError(resp)}`)
        }
        const list = await resp.json()
        setMaps(Array.isArray(list) ? list : [])
        return Array.isArray(list) ? list : []
    }

    const loadMapData = async (targetMap) => {
        if (!jwt || !targetMap) {
            setStations([])
            setMapAsset(null)
            return
        }

        const [ stationsResp, mapResp ] = await Promise.all([
            authorizedFetch(`admin/stations?map_name=${encodeURIComponent(targetMap)}`),
            authorizedFetch(`admin/station-maps/${encodeURIComponent(targetMap)}`),
        ])

        if (!stationsResp.ok) {
            throw new Error(`Failed to load stations: ${await parseError(stationsResp)}`)
        }

        const list = await stationsResp.json()
        setStations(Array.isArray(list) ? list : [])

        if (mapResp.ok) {
            const asset = await mapResp.json()
            setMapAsset(asset || null)
        } else {
            setMapAsset(null)
        }
    }

    const loadAll = async () => {
        if (!jwt) return
        setLoading(true)
        setErrorMessage('')
        try {
            const mapList = await loadMaps()
            let targetMap = currentMap
            if (!targetMap && mapList.length > 0) {
                targetMap = mapList[0].map_name
                history.replace(`/admin/station/${encodeURIComponent(targetMap)}`)
            }
            await loadMapData(targetMap)
        } catch (e) {
            setErrorMessage(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAll()
    }, [jwt])

    useEffect(() => {
        if (!jwt) return
        if (!currentMap) return

        setLoading(true)
        setErrorMessage('')
        loadMapData(currentMap)
            .catch((e) => setErrorMessage(e.message))
            .finally(() => setLoading(false))
    }, [currentMap, jwt])

    useEffect(() => {
        window.addEventListener('resize', refreshImageMetric)
        return () => window.removeEventListener('resize', refreshImageMetric)
    }, [])

    useEffect(() => {
        if (!currentMapMeta) return
        setMapForm({
            map_name: currentMapMeta.map_name || '',
        })
    }, [currentMapMeta])

    const getMapCoordinates = (clientX, clientY) => {
        const image = imageRef.current
        if (!image) return null
        const rect = image.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return null

        const x = ((clientX - rect.left) / rect.width) * imageMetric.naturalWidth
        const y = ((clientY - rect.top) / rect.height) * imageMetric.naturalHeight
        const normalizedX = Math.max(0, Math.min(imageMetric.naturalWidth, x))
        const normalizedY = Math.max(0, Math.min(imageMetric.naturalHeight, y))
        return {
            x: Number(normalizedX.toFixed(2)),
            y: Number(normalizedY.toFixed(2)),
        }
    }

    const parseStationLines = (value) => {
        try {
            const lines = JSON.parse(value || '[]')
            return Array.isArray(lines) ? lines : []
        } catch (e) {
            return []
        }
    }

    const useStation = (station) => {
        if (!station) return
        const draft = {
            map_name: station.map_name,
            identifier: station.identifier,
            label: station.label,
            local_name: station.local_name,
            photo_x: station.photo_x,
            photo_y: station.photo_y,
            map_x: station.map_x,
            map_y: station.map_y,
            line_info: station.line_info || '[]',
        }
        setSelectedStation(station.identifier)
        setStationDraft(draft)
        setOriginalDraft(draft)
        setLineDraft(parseStationLines(draft.line_info))
    }

    const displayedStations = useMemo(() => {
        if (!stationDraft || !selectedStation) return stations
        return stations.map((item) => (
            item.identifier === selectedStation ? {
                ...item,
                photo_x: stationDraft.photo_x,
                photo_y: stationDraft.photo_y,
            } : item
        ))
    }, [stations, selectedStation, stationDraft])

    const onMapClick = (e) => {
        if (dragging || !currentMap) return
        const coordinate = getMapCoordinates(e.clientX, e.clientY)
        if (!coordinate) return

        if (selectedStation) {
            setStationDraft({
                ...stationDraft,
                photo_x: coordinate.x,
                photo_y: coordinate.y,
            })
            return
        }

        const identifier = `station_${Date.now()}`
        const newDraft = {
            map_name: currentMap,
            identifier,
            label: '',
            local_name: '',
            photo_x: coordinate.x,
            photo_y: coordinate.y,
            map_x: 0,
            map_y: 0,
            line_info: '[]',
        }
        setSelectedStation(identifier)
        setStationDraft(newDraft)
        setOriginalDraft(newDraft)
        setLineDraft([])
    }

    const onPinMouseDown = (identifier) => (e) => {
        e.stopPropagation()
        const station = displayedStations.find((item) => item.identifier === identifier)
        useStation(station)
        setDragging(true)
    }

    const onMapMouseMove = (e) => {
        if (!dragging || !stationDraft) return
        const coordinate = getMapCoordinates(e.clientX, e.clientY)
        if (!coordinate) return
        setStationDraft({
            ...stationDraft,
            photo_x: coordinate.x,
            photo_y: coordinate.y,
        })
    }

    const stopDragging = () => {
        setDragging(false)
    }

    const onDraftChange = (field) => (e) => {
        const value = e.target.value
        setStationDraft({
            ...stationDraft,
            [field]: field.includes('_x') || field.includes('_y') ? Number(value) : value,
        })
    }

    const onSaveStation = async () => {
        if (!stationDraft || !currentMap) return
        setErrorMessage('')
        try {
            const payload = {
                ...stationDraft,
                line_info: JSON.stringify(lineDraft),
            }

            const resp = await authorizedFetch('admin/stations', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            if (!resp.ok) {
                setErrorMessage(`Failed to save station: ${await parseError(resp)}`)
                return
            }

            setAlertMessage('Station saved')
            triggerAlert()
            await loadMapData(currentMap)
        } catch (e) {
            setErrorMessage(`Failed to save station: ${e.message}`)
        }
    }

    const onSaveLines = async () => {
        if (!stationDraft || !currentMap) return
        setErrorMessage('')
        try {
            const resp = await authorizedFetch('admin/stations/lines', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    map_name: stationDraft.map_name,
                    identifier: stationDraft.identifier,
                    lines: lineDraft,
                }),
            })
            if (!resp.ok) {
                setErrorMessage(`Failed to save lines: ${await parseError(resp)}`)
                return
            }
            setAlertMessage('Station lines saved')
            triggerAlert()
            await loadMapData(currentMap)
        } catch (e) {
            setErrorMessage(`Failed to save lines: ${e.message}`)
        }
    }

    const onExportJSON = async () => {
        if (!currentMap) return
        setErrorMessage('')
        try {
            const resp = await authorizedFetch(`admin/stations/export/${encodeURIComponent(currentMap)}`)
            if (!resp.ok) {
                setErrorMessage(`Failed to export station JSON: ${await parseError(resp)}`)
                return
            }
            const text = await resp.text()
            const blob = new Blob([text], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${currentMap.toLowerCase()}-stations.json`
            link.click()
            window.URL.revokeObjectURL(url)
            setAlertMessage('JSON exported')
            triggerAlert()
        } catch (e) {
            setErrorMessage(`Failed to export station JSON: ${e.message}`)
        }
    }

    const onUploadImage = async (event) => {
        const file = event.target.files && event.target.files[0]
        if (!file || !currentMap) return

        setErrorMessage('')
        try {
            const formData = new FormData()
            formData.append('file', file)

            const resp = await authorizedFetch(`admin/station-maps/${encodeURIComponent(currentMap)}`, {
                method: 'POST',
                body: formData,
            })
            if (!resp.ok) {
                setErrorMessage(`Failed to upload map image: ${await parseError(resp)}`)
                return
            }

            const payload = await resp.json()
            setMapAsset(payload)
            setAlertMessage('Map image uploaded')
            triggerAlert()
            await loadMaps()
        } catch (e) {
            setErrorMessage(`Failed to upload map image: ${e.message}`)
        } finally {
            event.target.value = ''
        }
    }

    const onLineChange = (index, field) => (e) => {
        const value = e.target.value
        setLineDraft((before) => before.map((item, itemIndex) => (
            itemIndex === index ? {
                ...item,
                [field]: field === 'position' ? Number(value) : value,
            } : item
        )))
    }

    const onCreateMap = async () => {
        setErrorMessage('')
        try {
            const resp = await authorizedFetch('admin/train-station-maps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mapForm),
            })
            if (!resp.ok) {
                setErrorMessage(`Failed to create map: ${await parseError(resp)}`)
                return
            }
            const payload = await resp.json()
            await loadMaps()
            setAlertMessage('Map created')
            triggerAlert()
            history.replace(`/admin/station/${encodeURIComponent(payload.mapName || mapForm.map_name)}`)
            setMapForm({ map_name: '' })
        } catch (e) {
            setErrorMessage(`Failed to create map: ${e.message}`)
        }
    }

    const onDeleteMap = async (name) => {
        if (!window.confirm(`Delete map ${name}?`)) return
        setErrorMessage('')
        try {
            const resp = await authorizedFetch(`admin/train-station-maps/${encodeURIComponent(name)}`, {
                method: 'DELETE',
            })
            if (!resp.ok) {
                setErrorMessage(`Failed to delete map: ${await parseError(resp)}`)
                return
            }
            const refreshed = await loadMaps()
            setAlertMessage('Map deleted')
            triggerAlert()
            if (currentMap === name) {
                if (refreshed.length > 0) {
                    history.replace(`/admin/station/${encodeURIComponent(refreshed[0].map_name)}`)
                } else {
                    history.replace('/admin/station')
                }
            }
        } catch (e) {
            setErrorMessage(`Failed to delete map: ${e.message}`)
        }
    }

    const mapActions = (
        <>
            <Button
                className='admin-action-button'
                variant='outlined'
                startIcon={<RefreshIcon />}
                onClick={loadAll}
                disabled={loading}
            >
                Refresh
            </Button>
            <input
                ref={uploadRef}
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={onUploadImage}
            />
            <Button
                className='admin-action-button'
                variant='outlined'
                startIcon={<CloudUploadIcon />}
                onClick={() => uploadRef.current && uploadRef.current.click()}
                disabled={!currentMap}
            >
                Upload Map
            </Button>
            <Button
                className='admin-action-button'
                variant='contained'
                startIcon={<DownloadIcon />}
                onClick={onExportJSON}
                disabled={!currentMap}
            >
                Export JSON
            </Button>
        </>
    )

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
        },
    }

    return (
        <AdminPageShell
            title='Train Station Editor'
            description='Select a map, then upload image, click to add stations, drag pins, edit lines, and export JSON.'
            alertOpen={alertOpen}
            alertMessage={alertMessage}
            actions={mapActions}
        >
            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}

            <Card className='admin-panel'>
                <CardContent>
                    <Stack spacing={1.5}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                            Train Map Registry
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: 'minmax(180px, 1fr)',
                                },
                                gap: 1,
                            }}
                        >
                            <TextField size='small' label='Map Name' value={mapForm.map_name} onChange={(e) => setMapForm({ ...mapForm, map_name: e.target.value })} fullWidth sx={fieldSx} />
                        </Box>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                            <Button className='admin-action-button' variant='contained' startIcon={<AddCircleIcon />} onClick={onCreateMap}>
                                Create
                            </Button>
                        </Stack>
                        <Divider />
                        <Stack spacing={0.75}>
                            {maps.map((item) => (
                                <Box
                                    key={item.map_name}
                                    sx={{
                                        border: '1px solid #d4dde7',
                                        borderRadius: 1.5,
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: currentMap === item.map_name ? '#e7f1ff' : '#fff',
                                    }}
                                >
                                    <Box
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => history.replace(`/admin/station/${encodeURIComponent(item.map_name)}`)}
                                    >
                                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                                            {item.map_name}
                                        </Typography>
                                        <Typography variant='body2' color='text.secondary'>
                                            stations: {item.station_count} | image: {item.has_image ? item.image_path : 'none'}
                                        </Typography>
                                    </Box>
                                    <IconButton className='admin-icon-button' onClick={() => onDeleteMap(item.map_name)}>
                                        <DeleteIcon color='error' />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card className='admin-panel'>
                <CardContent>
                    <Stack spacing={1}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                            Map Canvas {currentMap ? `(${currentMap})` : ''}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Select a map from registry. Click to place station draft or update selected pin; drag pin to reposition.
                        </Typography>
                        <Box
                            sx={{
                                width: '100%',
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                border: '1px solid #c8d6e5',
                                backgroundColor: '#00111f',
                                position: 'relative',
                                userSelect: 'none',
                            }}
                            onClick={onMapClick}
                            onMouseMove={onMapMouseMove}
                            onMouseUp={stopDragging}
                            onMouseLeave={stopDragging}
                        >
                            <img
                                ref={imageRef}
                                src={mapImageLink}
                                style={{ width: '100%', display: 'block' }}
                                onLoad={refreshImageMetric}
                            />
                            {displayedStations.map((station) => {
                                const left = (station.photo_x / imageMetric.naturalWidth) * imageMetric.displayWidth
                                const top = (station.photo_y / imageMetric.naturalHeight) * imageMetric.displayHeight
                                return (
                                    <Box
                                        key={station.identifier}
                                        onMouseDown={onPinMouseDown(station.identifier)}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            useStation(station)
                                        }}
                                        sx={{
                                            position: 'absolute',
                                            width: 14,
                                            height: 14,
                                            borderRadius: '50%',
                                            border: '2px solid #fff',
                                            backgroundColor: selectedStation === station.identifier ? '#ff8c00' : '#0d6efd',
                                            left: `${left - 7}px`,
                                            top: `${top - 7}px`,
                                            cursor: 'grab',
                                            boxShadow: '0 0 0 2px rgba(0,0,0,0.4)',
                                        }}
                                    />
                                )
                            })}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Card className='admin-panel'>
                <CardContent>
                    <Stack spacing={1.25}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                            Station Editor
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: 'repeat(3, minmax(180px, 1fr))',
                                },
                                gap: 1,
                            }}
                        >
                            <TextField size='small' label='Identifier' value={stationDraft?.identifier || ''} onChange={onDraftChange('identifier')} fullWidth sx={fieldSx} />
                            <TextField size='small' label='Label' value={stationDraft?.label || ''} onChange={onDraftChange('label')} fullWidth sx={fieldSx} />
                            <TextField size='small' label='Local Name' value={stationDraft?.local_name || ''} onChange={onDraftChange('local_name')} fullWidth sx={fieldSx} />
                        </Box>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    md: 'repeat(4, minmax(180px, 1fr))',
                                },
                                gap: 1,
                            }}
                        >
                            <TextField size='small' type='number' label='Photo X' value={stationDraft?.photo_x || 0} onChange={onDraftChange('photo_x')} fullWidth sx={fieldSx} />
                            <TextField size='small' type='number' label='Photo Y' value={stationDraft?.photo_y || 0} onChange={onDraftChange('photo_y')} fullWidth sx={fieldSx} />
                            <TextField size='small' type='number' label='Map X' value={stationDraft?.map_x || 0} onChange={onDraftChange('map_x')} fullWidth sx={fieldSx} />
                            <TextField size='small' type='number' label='Map Y' value={stationDraft?.map_y || 0} onChange={onDraftChange('map_y')} fullWidth sx={fieldSx} />
                        </Box>
                        <Stack direction='row' spacing={1}>
                            <Button className='admin-action-button' variant='contained' startIcon={<SaveIcon />} disabled={!stationDraft || !currentMap} onClick={onSaveStation}>
                                Save Station
                            </Button>
                            <Button
                                className='admin-action-button'
                                variant='outlined'
                                startIcon={<UndoIcon />}
                                disabled={!originalDraft}
                                onClick={() => {
                                    setStationDraft(originalDraft)
                                    setLineDraft(parseStationLines(originalDraft.line_info))
                                }}
                            >
                                Cancel Changes
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card className='admin-panel'>
                <CardContent>
                    <Stack spacing={1.25}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                            Station Line Management
                        </Typography>
                        {lineDraft.map((line, index) => (
                            <Stack key={index} direction={{ xs: 'column', md: 'row' }} spacing={1}>
                                <TextField size='small' label='Line Name' value={line.name || ''} onChange={onLineChange(index, 'name')} fullWidth sx={fieldSx} />
                                <TextField size='small' label='Local Name' value={line.localName || ''} onChange={onLineChange(index, 'localName')} fullWidth sx={fieldSx} />
                                <TextField size='small' label='Colour' value={line.colour || ''} onChange={onLineChange(index, 'colour')} fullWidth sx={fieldSx} />
                                <TextField size='small' type='number' label='Position' value={line.position || 0} onChange={onLineChange(index, 'position')} sx={{ ...fieldSx, width: { xs: '100%', md: 180 } }} />
                                <IconButton className='admin-icon-button' onClick={() => setLineDraft((before) => before.filter((_, itemIndex) => itemIndex !== index))}>
                                    <DeleteIcon color='error' />
                                </IconButton>
                            </Stack>
                        ))}
                        <Divider />
                        <Stack direction='row' spacing={1}>
                            <Button
                                className='admin-action-button'
                                variant='outlined'
                                startIcon={<AddCircleIcon />}
                                onClick={() => setLineDraft((before) => [
                                    ...before,
                                    { name: '', localName: '', colour: '', position: before.length + 1 },
                                ])}
                            >
                                Add Line
                            </Button>
                            <Button className='admin-action-button' variant='contained' startIcon={<SaveIcon />} disabled={!stationDraft || !currentMap} onClick={onSaveLines}>
                                Save Lines
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </AdminPageShell>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(TrainStationManage)
