import React, { useEffect, useMemo, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import EditIcon from '@mui/icons-material/Edit'
import ListAltIcon from '@mui/icons-material/ListAlt'
import RefreshIcon from '@mui/icons-material/Refresh'
import SaveIcon from '@mui/icons-material/Save'
import UndoIcon from '@mui/icons-material/Undo'
import QuickPinchZoom, { make2dTransformValue, make3dTransformValue, hasTranslate3DSupport } from 'react-quick-pinch-zoom'

import useBoop from '../../hooks/useBoop'
import backend from '../../constant/backend'
import AdminPageShell from '../../components/admin/AdminPageShell'
import MTRImage from '../../images/station/hkmtr2.jpeg'

const defaultDimension = {
    width: 2000,
    height: 1322,
}
const mapMinZoom = 0.2

const createLineDraft = () => ({
    id: 0,
    name: '',
    localName: '',
    colour: '',
})

const createStationLineDraft = (position = 1) => ({
    lineId: '',
    position,
})

const normalizeLine = (line) => ({
    name: line?.name || '',
    localName: line?.localName || '',
    colour: line?.colour || '',
})

const isSameLine = (a, b) => {
    const left = normalizeLine(a)
    const right = normalizeLine(b)
    return (
        left.name === right.name
        && left.localName === right.localName
        && left.colour === right.colour
    )
}

const parseLines = (lineInfo) => {
    try {
        const parsed = JSON.parse(lineInfo || '[]')
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
const use3DTransform = hasTranslate3DSupport() && !isSafari
const makeTransformValue = use3DTransform ? make3dTransformValue : make2dTransformValue

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

    const [ lineCatalog, setLineCatalog ] = useState([])
    const [ stationLineItems, setStationLineItems ] = useState([])
    const [ lineDialogOpen, setLineDialogOpen ] = useState(false)
    const [ lineDialogDraft, setLineDialogDraft ] = useState([])

    const [ dragging, setDragging ] = useState(false)

    const [ mapDialogOpen, setMapDialogOpen ] = useState(false)
    const [ mapDialogMode, setMapDialogMode ] = useState('create')
    const [ mapDialogName, setMapDialogName ] = useState('') // identifier
    const [ mapDialogLabel, setMapDialogLabel ] = useState('') // map display name
    const [ mapDialogImage, setMapDialogImage ] = useState(null)
    const [ mapDialogIcon, setMapDialogIcon ] = useState(null)

    const [ alertOpen, triggerAlert ] = useBoop(2500)
    const [ alertMessage, setAlertMessage ] = useState('')

    const imageRef = useRef(null)
    const mapContentRef = useRef(null)
    const pinchZoomRef = useRef(null)
    const transformRef = useRef({ x: 0, y: 0, scale: 1 })
    const uploadRef = useRef(null)
    const importRef = useRef(null)
    const [ imageMetric, setImageMetric ] = useState({
        naturalWidth: defaultDimension.width,
        naturalHeight: defaultDimension.height,
        displayWidth: defaultDimension.width,
        displayHeight: defaultDimension.height,
    })

    const currentMap = useMemo(() => (routeMapName ? decodeURIComponent(routeMapName) : ''), [routeMapName])

    const currentMapMeta = useMemo(() => maps.find((item) => item.map_name === currentMap) || null, [maps, currentMap])

    const mapImageLink = useMemo(() => {
        if (mapAsset?.image_path) return `${backend.IMAGE_LINK}${mapAsset.image_path}`
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

    const onZoomUpdate = ({ x, y, scale }) => {
        const element = mapContentRef.current
        if (!element) return
        transformRef.current = { x, y, scale }
        element.style.setProperty('transform', makeTransformValue({ x, y, scale }))
    }

    const resetMapView = () => {
        if (!pinchZoomRef.current) return
        pinchZoomRef.current.scaleTo({ x: 0, y: 0, scale: 1 })
        transformRef.current = { x: 0, y: 0, scale: 1 }
    }

    const normalizeCatalogFromStations = (stationList) => {
        const catalog = []
        stationList.forEach((station) => {
            const lines = parseLines(station.line_info)
            lines.forEach((line) => {
                const normalized = normalizeLine(line)
                if (!catalog.find((item) => isSameLine(item, normalized))) {
                    catalog.push({
                        id: 0,
                        ...normalized,
                    })
                }
            })
        })
        return catalog.sort((a, b) => a.name.localeCompare(b.name))
    }

    const mergeCatalog = (baseCatalog, stationLines) => {
        const merged = [ ...baseCatalog ]
        stationLines.forEach((line) => {
            const normalized = normalizeLine(line)
            const found = merged.find((item) => isSameLine(item, normalized))
            if (!found) {
                merged.push({
                    id: 0,
                    ...normalized,
                })
            }
        })
        return merged.sort((a, b) => a.name.localeCompare(b.name))
    }

    const loadMaps = async () => {
        if (!jwt) return []
        const resp = await authorizedFetch('admin/train-station-maps')
        if (!resp.ok) throw new Error(`Failed to load maps: ${await parseError(resp)}`)
        const list = await resp.json()
        const safe = Array.isArray(list) ? list : []
        setMaps(safe)
        return safe
    }

    const loadLineCatalog = async (targetMap, fallbackStations = []) => {
        if (!targetMap) {
            setLineCatalog([])
            return []
        }
        const resp = await authorizedFetch(`admin/station-lines?map_name=${encodeURIComponent(targetMap)}`)
        if (!resp.ok) {
            const fallback = normalizeCatalogFromStations(fallbackStations)
            setLineCatalog(fallback)
            return fallback
        }
        const list = await resp.json()
        const safe = Array.isArray(list)
            ? list.map((item) => ({
                id: Number(item.id || 0),
                name: item.name || '',
                localName: item.local_name || item.localName || '',
                colour: item.colour || '',
            }))
            : []
        setLineCatalog(safe)
        return safe
    }

    const loadMapData = async (targetMap) => {
        if (!jwt || !targetMap) {
            setStations([])
            setLineCatalog([])
            setMapAsset(null)
            return
        }

        const [ stationsResp, mapResp ] = await Promise.all([
            authorizedFetch(`admin/stations?map_name=${encodeURIComponent(targetMap)}`),
            authorizedFetch(`admin/station-maps/${encodeURIComponent(targetMap)}`),
        ])

        if (!stationsResp.ok) throw new Error(`Failed to load stations: ${await parseError(stationsResp)}`)

        const list = await stationsResp.json()
        const safeStations = Array.isArray(list) ? list : []
        setStations(safeStations)
        await loadLineCatalog(targetMap, safeStations)

        if (mapResp.ok) {
            const asset = await mapResp.json()
            setMapAsset(asset || null)
        } else {
            setMapAsset(null)
        }

        setSelectedStation(null)
        setStationDraft(null)
        setOriginalDraft(null)
        setStationLineItems([])
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
        if (!jwt || !currentMap) return
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
        resetMapView()
    }, [currentMap])

    const getMapCoordinates = (clientX, clientY) => {
        const content = mapContentRef.current
        if (!content) return null
        const rect = content.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0) return null

        const x = ((clientX - rect.left) / rect.width) * imageMetric.naturalWidth
        const y = ((clientY - rect.top) / rect.height) * imageMetric.naturalHeight
        const normalizedX = Math.max(0, Math.min(imageMetric.naturalWidth, x))
        const normalizedY = Math.max(0, Math.min(imageMetric.naturalHeight, y))
        return { x: Number(normalizedX.toFixed(2)), y: Number(normalizedY.toFixed(2)) }
    }

    const buildStationLineDraft = (lines, catalog) => lines.map((line, index) => {
        const found = catalog.find((item) => isSameLine(item, line))
        const position = Number(line.position || index + 1)
        return {
            lineId: found ? String(found.id || `${found.name}|${found.localName}|${found.colour}`) : '',
            position,
        }
    })

    const useStation = (station) => {
        if (!station) return

        const lines = parseLines(station.line_info)
        const mergedCatalog = mergeCatalog(lineCatalog, lines)
        setLineCatalog(mergedCatalog)
        setStationLineItems(buildStationLineDraft(lines, mergedCatalog))

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
    }

    const displayedStations = useMemo(() => {
        if (!stationDraft || !selectedStation) return stations
        const updated = stations.map((item) => (
            item.identifier === selectedStation
                ? { ...item, photo_x: stationDraft.photo_x, photo_y: stationDraft.photo_y }
                : item
        ))
        const exists = updated.some((item) => item.identifier === selectedStation)
        if (!exists && stationDraft?.identifier) {
            updated.push({
                identifier: stationDraft.identifier,
                map_name: stationDraft.map_name || currentMap,
                label: stationDraft.label || '',
                local_name: stationDraft.local_name || '',
                photo_x: Number(stationDraft.photo_x || 0),
                photo_y: Number(stationDraft.photo_y || 0),
                map_x: Number(stationDraft.map_x || 0),
                map_y: Number(stationDraft.map_y || 0),
                line_info: stationDraft.line_info || '[]',
            })
        }
        return updated
    }, [stations, selectedStation, stationDraft, currentMap])

    const onMapClick = (e) => {
        if (dragging || !currentMap) return
        const coordinate = getMapCoordinates(e.clientX, e.clientY)
        if (!coordinate) return

        if (selectedStation) {
            setStationDraft({ ...stationDraft, photo_x: coordinate.x, photo_y: coordinate.y })
            return
        }

        const identifier = `station_${Date.now()}`
        const draft = {
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
        setStationDraft(draft)
        setOriginalDraft(draft)
        setStationLineItems([])
    }

    const onAddStation = () => {
        if (!currentMap) return
        const identifier = `station_${Date.now()}`
        const draft = {
            map_name: currentMap,
            identifier,
            label: '',
            local_name: '',
            photo_x: 32,
            photo_y: 32,
            map_x: 0,
            map_y: 0,
            line_info: '[]',
        }
        setSelectedStation(identifier)
        setStationDraft(draft)
        setOriginalDraft(draft)
        setStationLineItems([])
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
        setStationDraft({ ...stationDraft, photo_x: coordinate.x, photo_y: coordinate.y })
    }

    const stopDragging = () => {
        setDragging(false)
    }

    const onDraftChange = (field) => (e) => {
        const raw = e.target.value
        const value = field.endsWith('_x') || field.endsWith('_y') ? Number(raw) : raw
        setStationDraft((before) => ({
            ...(before || {}),
            [field]: value,
        }))
    }

    const onSaveStation = async () => {
        if (!stationDraft || !currentMap) return
        setErrorMessage('')

        try {
            const selectedLines = stationLineItems
                .map((row) => {
                    const line = lineCatalog.find((item) => String(item.id || `${item.name}|${item.localName}|${item.colour}`) === row.lineId)
                    if (!line) return null
                    return {
                        name: line.name,
                        localName: line.localName,
                        colour: line.colour,
                        position: Number(row.position || 0),
                    }
                })
                .filter(Boolean)
                .sort((a, b) => Number(a.position || 0) - Number(b.position || 0))

            const payload = {
                ...stationDraft,
                line_info: JSON.stringify(selectedLines),
            }

            const resp = await authorizedFetch('admin/stations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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

    const onDeleteStation = async () => {
        if (!stationDraft || !currentMap) return
        const identifier = (stationDraft.identifier || '').trim()
        if (!identifier) return

        const isPersistedStation = stations.some((item) => item.identifier === identifier)
        if (!window.confirm(`Delete station ${identifier}?`)) return

        if (!isPersistedStation) {
            setSelectedStation(null)
            setStationDraft(null)
            setOriginalDraft(null)
            setStationLineItems([])
            setAlertMessage('Draft removed')
            triggerAlert()
            return
        }

        setErrorMessage('')
        try {
            const resp = await authorizedFetch(`admin/stations/${encodeURIComponent(currentMap)}/${encodeURIComponent(identifier)}`, {
                method: 'DELETE',
            })
            if (!resp.ok) {
                setErrorMessage(`Failed to delete station: ${await parseError(resp)}`)
                return
            }
            setAlertMessage('Station deleted')
            triggerAlert()
            await loadMapData(currentMap)
        } catch (e) {
            setErrorMessage(`Failed to delete station: ${e.message}`)
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

    const onImportJSON = async (event) => {
        const file = event.target.files && event.target.files[0]
        if (!file || !currentMap) return
        setErrorMessage('')
        try {
            const formData = new FormData()
            formData.append('file', file)
            const resp = await authorizedFetch(`admin/stations/import/${encodeURIComponent(currentMap)}`, {
                method: 'POST',
                body: formData,
            })
            if (!resp.ok) {
                setErrorMessage(`Failed to import station JSON: ${await parseError(resp)}`)
                return
            }
            await loadMapData(currentMap)
            await loadMaps()
            setAlertMessage('Station JSON imported')
            triggerAlert()
        } catch (e) {
            setErrorMessage(`Failed to import station JSON: ${e.message}`)
        } finally {
            event.target.value = ''
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

    const onUploadMapIcon = async (file, targetMap) => {
        if (!file || !targetMap) return
        const formData = new FormData()
        formData.append('file', file)
        const resp = await authorizedFetch(`admin/station-map-icons/${encodeURIComponent(targetMap)}`, {
            method: 'POST',
            body: formData,
        })
        if (!resp.ok) {
            throw new Error(`Failed to upload map icon: ${await parseError(resp)}`)
        }
    }

    const onCreateOrUpdateMap = async () => {
        const identifier = mapDialogName.trim()
        const mapLabel = mapDialogLabel.trim()
        if (!identifier) {
            setErrorMessage('Map identifier is required')
            return
        }

        setErrorMessage('')
        try {
            let targetName = identifier

            if (mapDialogMode === 'create') {
                const resp = await authorizedFetch('admin/train-station-maps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        map_name: identifier,
                        map_label: mapLabel || identifier,
                    }),
                })
                if (!resp.ok) {
                    setErrorMessage(`Failed to create map: ${await parseError(resp)}`)
                    return
                }
                const payload = await resp.json()
                targetName = payload.map_name || payload.mapName || identifier
            } else {
                const resp = await authorizedFetch(`admin/train-station-maps/${encodeURIComponent(currentMap)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        new_map_name: identifier,
                        new_map_label: mapLabel || identifier,
                    }),
                })
                if (!resp.ok) {
                    setErrorMessage(`Failed to update map: ${await parseError(resp)}`)
                    return
                }
            }

            if (mapDialogImage) {
                const formData = new FormData()
                formData.append('file', mapDialogImage)
                const uploadResp = await authorizedFetch(`admin/station-maps/${encodeURIComponent(targetName)}`, {
                    method: 'POST',
                    body: formData,
                })
                if (!uploadResp.ok) {
                    setErrorMessage(`Map saved but image upload failed: ${await parseError(uploadResp)}`)
                    return
                }
            }
            if (mapDialogIcon) {
                await onUploadMapIcon(mapDialogIcon, targetName)
            }

            await loadMaps()
            history.replace(`/admin/station/${encodeURIComponent(targetName)}`)
            setMapDialogOpen(false)
            setMapDialogImage(null)
            setMapDialogIcon(null)

            setAlertMessage(mapDialogMode === 'create' ? 'Map created' : 'Map updated')
            triggerAlert()
        } catch (e) {
            setErrorMessage(`Failed to save map: ${e.message}`)
        }
    }

    const onDeleteMap = async () => {
        if (!currentMap) return
        if (!window.confirm(`Delete map ${currentMap}?`)) return

        setErrorMessage('')
        try {
            const resp = await authorizedFetch(`admin/train-station-maps/${encodeURIComponent(currentMap)}`, { method: 'DELETE' })
            if (!resp.ok) {
                setErrorMessage(`Failed to delete map: ${await parseError(resp)}`)
                return
            }

            const refreshed = await loadMaps()
            setAlertMessage('Map deleted')
            triggerAlert()

            if (refreshed.length > 0) {
                history.replace(`/admin/station/${encodeURIComponent(refreshed[0].map_name)}`)
            } else {
                history.replace('/admin/station')
            }
        } catch (e) {
            setErrorMessage(`Failed to delete map: ${e.message}`)
        }
    }

    const openCreateMapDialog = () => {
        setMapDialogMode('create')
        setMapDialogName('')
        setMapDialogLabel('')
        setMapDialogImage(null)
        setMapDialogIcon(null)
        setMapDialogOpen(true)
    }

    const openEditMapDialog = () => {
        if (!currentMap) return
        setMapDialogMode('edit')
        setMapDialogName(currentMap)
        setMapDialogLabel(currentMapMeta?.map_label || currentMap)
        setMapDialogImage(null)
        setMapDialogIcon(null)
        setMapDialogOpen(true)
    }

    const openLineDialog = () => {
        setLineDialogDraft(lineCatalog.map((line) => ({
            id: Number(line.id || 0),
            name: line.name || '',
            localName: line.localName || '',
            colour: line.colour || '',
        })))
        setLineDialogOpen(true)
    }

    const saveLineCatalog = async () => {
        if (!currentMap) return
        setErrorMessage('')
        try {
            const payload = {
                map_name: currentMap,
                lines: lineDialogDraft.map((line) => ({
                    id: Number(line.id || 0),
                    name: (line.name || '').trim(),
                    local_name: (line.localName || '').trim(),
                    colour: (line.colour || '').trim(),
                })),
            }
            const resp = await authorizedFetch('admin/station-lines', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!resp.ok) {
                setErrorMessage(`Failed to save station lines: ${await parseError(resp)}`)
                return
            }
            const list = await resp.json()
            const safe = Array.isArray(list)
                ? list.map((item) => ({
                    id: Number(item.id || 0),
                    name: item.name || '',
                    localName: item.local_name || item.localName || '',
                    colour: item.colour || '',
                }))
                : []
            setLineCatalog(safe)
            setLineDialogOpen(false)
            setAlertMessage('Station lines saved')
            triggerAlert()
        } catch (e) {
            setErrorMessage(`Failed to save station lines: ${e.message}`)
        }
    }

    const resetStationDraft = () => {
        if (!originalDraft) return
        const lines = parseLines(originalDraft.line_info)
        setStationLineItems(buildStationLineDraft(lines, lineCatalog))
        setStationDraft(originalDraft)
    }

    const mapActions = (
        <>
            <Button className='admin-action-button' variant='outlined' startIcon={<RefreshIcon />} onClick={loadAll} disabled={loading}>
                Refresh
            </Button>
            <input ref={uploadRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={onUploadImage} />
            <input ref={importRef} type='file' accept='application/json,.json' style={{ display: 'none' }} onChange={onImportJSON} />
            <Button
                className='admin-action-button'
                variant='outlined'
                startIcon={<CloudUploadIcon />}
                onClick={() => uploadRef.current && uploadRef.current.click()}
                disabled={!currentMap}
            >
                Upload Map Image
            </Button>
            <Button className='admin-action-button' variant='contained' startIcon={<DownloadIcon />} onClick={onExportJSON} disabled={!currentMap}>
                Export JSON
            </Button>
            <Button className='admin-action-button' variant='contained' startIcon={<CloudUploadIcon />} onClick={() => importRef.current && importRef.current.click()} disabled={!currentMap}>
                Import JSON
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
            description='Manage map registry, line catalog, and station-line positions.'
            alertOpen={alertOpen}
            alertMessage={alertMessage}
            actions={mapActions}
        >
            {errorMessage ? <Alert severity='error'>{errorMessage}</Alert> : null}

            <Card className='admin-panel'>
                <CardContent>
                    <Stack spacing={1.25}>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Train Map Registry</Typography>
                            <Button className='admin-action-button' variant='contained' startIcon={<AddCircleIcon />} onClick={openCreateMapDialog}>
                                Create
                            </Button>
                        </Stack>
                        <FormControl size='small' fullWidth sx={fieldSx}>
                            <InputLabel id='map-select-label'>Map Registry</InputLabel>
                            <Select
                                labelId='map-select-label'
                                label='Map Registry'
                                value={currentMap || ''}
                                onChange={(e) => history.replace(`/admin/station/${encodeURIComponent(e.target.value)}`)}
                            >
                                {maps.map((item) => (
                                    <MenuItem key={item.map_name} value={item.map_name}>
                                        {(item.map_label || item.map_name)} ({item.map_name})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Typography variant='body2' color='text.secondary'>
                            Identifier: {currentMapMeta?.map_name || '-'} | Map Name: {currentMapMeta?.map_label || currentMapMeta?.map_name || '-'} | Stations: {currentMapMeta?.station_count || 0} | Image: {currentMapMeta?.image_path || 'none'} | Icon: {currentMapMeta?.icon_path || 'none'}
                        </Typography>
                        {currentMapMeta?.icon_path ? (
                            <Box
                                component='img'
                                src={`${backend.IMAGE_LINK}${currentMapMeta.icon_path}`}
                                alt='Map icon preview'
                                sx={{
                                    width: 52,
                                    height: 52,
                                    objectFit: 'contain',
                                    border: '1px solid #c8d6e5',
                                    borderRadius: 1,
                                    backgroundColor: '#fff',
                                    p: 0.5,
                                }}
                            />
                        ) : null}
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                            <Button className='admin-action-button' variant='outlined' startIcon={<EditIcon />} disabled={!currentMap} onClick={openEditMapDialog}>
                                Edit Selected
                            </Button>
                            <Button className='admin-action-button' variant='outlined' startIcon={<ListAltIcon />} disabled={!currentMap} onClick={openLineDialog}>
                                Line Manage
                            </Button>
                            <Button className='admin-action-button' variant='outlined' color='error' startIcon={<DeleteIcon />} disabled={!currentMap} onClick={onDeleteMap}>
                                Delete Selected
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card className='admin-panel'>
                <CardContent>
                    <Stack spacing={1}>
                        <Stack direction='row' alignItems='center' justifyContent='space-between'>
                            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Map Canvas {currentMap ? `(${currentMap})` : ''}</Typography>
                            <Button className='admin-action-button' variant='outlined' startIcon={<AddCircleIcon />} onClick={onAddStation} disabled={!currentMap}>
                                Add Station
                            </Button>
                        </Stack>
                        <Typography variant='body2' color='text.secondary'>Click to create station draft, click/drag pin to adjust position.</Typography>
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
                            onMouseMove={onMapMouseMove}
                            onMouseUp={stopDragging}
                            onMouseLeave={stopDragging}
                        >
                            <QuickPinchZoom
                                ref={pinchZoomRef}
                                draggableUnzoomed={false}
                                minZoom={mapMinZoom}
                                zoomOutFactor={mapMinZoom}
                                onUpdate={onZoomUpdate}
                            >
                                <div
                                    ref={mapContentRef}
                                    onClick={onMapClick}
                                    style={{
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    <img ref={imageRef} src={mapImageLink} alt='Station map' style={{ width: '100%', display: 'block' }} onLoad={refreshImageMetric} />
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
                                </div>
                            </QuickPinchZoom>
                            <IconButton
                                aria-label='Reset map view'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    resetMapView()
                                }}
                                size='small'
                                sx={{
                                    position: 'absolute',
                                    right: 12,
                                    bottom: 12,
                                    width: 36,
                                    height: 36,
                                    border: '1px solid #d1deec',
                                    backgroundColor: '#ffffff',
                                    color: '#123',
                                    zIndex: 3,
                                    '&:hover': {
                                        backgroundColor: '#f2f7fc',
                                    },
                                }}
                            >
                                <CenterFocusStrongIcon fontSize='small' />
                            </IconButton>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Card className='admin-panel'>
                <CardContent>
                    <Stack spacing={1.25}>
                        <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Station Editor</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(180px, 1fr))' }, gap: 1 }}>
                            <TextField size='small' label='Identifier' value={stationDraft?.identifier || ''} onChange={onDraftChange('identifier')} fullWidth sx={fieldSx} />
                            <TextField size='small' label='Label' value={stationDraft?.label || ''} onChange={onDraftChange('label')} fullWidth sx={fieldSx} />
                            <TextField size='small' label='Local Name' value={stationDraft?.local_name || ''} onChange={onDraftChange('local_name')} fullWidth sx={fieldSx} />
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(180px, 1fr))' }, gap: 1 }}>
                            <TextField size='small' type='number' label='Photo X' value={stationDraft?.photo_x || 0} onChange={onDraftChange('photo_x')} fullWidth sx={fieldSx} />
                            <TextField size='small' type='number' label='Photo Y' value={stationDraft?.photo_y || 0} onChange={onDraftChange('photo_y')} fullWidth sx={fieldSx} />
                            <TextField size='small' type='number' label='Map X' value={stationDraft?.map_x || 0} onChange={onDraftChange('map_x')} fullWidth sx={fieldSx} />
                            <TextField size='small' type='number' label='Map Y' value={stationDraft?.map_y || 0} onChange={onDraftChange('map_y')} fullWidth sx={fieldSx} />
                        </Box>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>Station Lines (Line + Position)</Typography>
                        {stationLineItems.map((item, index) => (
                            <Box
                                key={`station-line-${index}`}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: 'minmax(180px, 1fr) minmax(180px, 1fr) auto' },
                                    gap: 1,
                                    alignItems: 'center',
                                }}
                            >
                                <TextField
                                    size='small'
                                    type='number'
                                    label='Position'
                                    value={item.position}
                                    onChange={(e) => setStationLineItems((before) => before.map((row, i) => i === index ? { ...row, position: Number(e.target.value) } : row))}
                                    fullWidth
                                    sx={fieldSx}
                                />
                                <FormControl size='small' fullWidth sx={fieldSx}>
                                    <InputLabel id={`station-line-${index}`}>Line</InputLabel>
                                    <Select
                                        labelId={`station-line-${index}`}
                                        label='Line'
                                        value={item.lineId}
                                        onChange={(e) => setStationLineItems((before) => before.map((row, i) => i === index ? { ...row, lineId: e.target.value } : row))}
                                    >
                                        {lineCatalog.map((line) => {
                                            const key = String(line.id || `${line.name}|${line.localName}|${line.colour}`)
                                            return (
                                                <MenuItem key={key} value={key}>
                                                    {line.name || '(Unnamed)'} ({line.localName || '-'})
                                                </MenuItem>
                                            )
                                        })}
                                    </Select>
                                </FormControl>
                                <IconButton className='admin-icon-button' onClick={() => setStationLineItems((before) => before.filter((_, i) => i !== index))}>
                                    <DeleteIcon color='error' />
                                </IconButton>
                            </Box>
                        ))}

                        <Button
                            className='admin-action-button'
                            variant='outlined'
                            startIcon={<AddCircleIcon />}
                            onClick={() => {
                                const nextPosition = stationLineItems.length + 1
                                setStationLineItems((before) => [ ...before, createStationLineDraft(nextPosition) ])
                            }}
                        >
                            Add Station Line Item
                        </Button>

                        <Stack direction='row' spacing={1}>
                            <Button className='admin-action-button' variant='contained' startIcon={<SaveIcon />} disabled={!stationDraft || !currentMap} onClick={onSaveStation}>
                                Save Station
                            </Button>
                            <Button className='admin-action-button' variant='outlined' startIcon={<UndoIcon />} disabled={!originalDraft} onClick={resetStationDraft}>
                                Cancel Changes
                            </Button>
                            <Button className='admin-action-button' variant='outlined' color='error' startIcon={<DeleteIcon />} disabled={!stationDraft || !currentMap} onClick={onDeleteStation}>
                                Delete Station
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={mapDialogOpen} onClose={() => setMapDialogOpen(false)} fullWidth maxWidth='sm'>
                <DialogTitle>{mapDialogMode === 'create' ? 'Create Train Map' : 'Edit Train Map'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.25} sx={{ mt: 0.5 }}>
                        <TextField
                            size='small'
                            label='Identifier'
                            value={mapDialogName}
                            onChange={(e) => setMapDialogName(e.target.value)}
                            fullWidth
                            sx={fieldSx}
                        />
                        <TextField
                            size='small'
                            label='Map Name'
                            value={mapDialogLabel}
                            onChange={(e) => setMapDialogLabel(e.target.value)}
                            fullWidth
                            sx={fieldSx}
                        />
                        <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />}>
                            {mapDialogImage ? `Selected: ${mapDialogImage.name}` : 'Select Map Image (Optional)'}
                            <input hidden type='file' accept='image/*' onChange={(e) => setMapDialogImage(e.target.files?.[0] || null)} />
                        </Button>
                        <Button component='label' variant='outlined' startIcon={<CloudUploadIcon />}>
                            {mapDialogIcon ? `Selected Icon: ${mapDialogIcon.name}` : 'Select Map Icon (Optional)'}
                            <input hidden type='file' accept='image/*' onChange={(e) => setMapDialogIcon(e.target.files?.[0] || null)} />
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMapDialogOpen(false)}>Cancel</Button>
                    <Button onClick={onCreateOrUpdateMap} variant='contained'>
                        {mapDialogMode === 'create' ? 'Create' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={lineDialogOpen} onClose={() => setLineDialogOpen(false)} fullWidth maxWidth='md'>
                <DialogTitle>Station Line Manage</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.25} sx={{ mt: 0.5 }}>
                        {lineDialogDraft.map((line, index) => (
                            <Box
                                key={`line-dialog-${index}`}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(180px, 1fr)) auto' },
                                    gap: 1,
                                    alignItems: 'center',
                                }}
                            >
                                <TextField
                                    size='small'
                                    label='Line Name'
                                    value={line.name}
                                    onChange={(e) => setLineDialogDraft((before) => before.map((row, i) => i === index ? { ...row, name: e.target.value } : row))}
                                    fullWidth
                                    sx={fieldSx}
                                />
                                <TextField
                                    size='small'
                                    label='Local Name'
                                    value={line.localName}
                                    onChange={(e) => setLineDialogDraft((before) => before.map((row, i) => i === index ? { ...row, localName: e.target.value } : row))}
                                    fullWidth
                                    sx={fieldSx}
                                />
                                <TextField
                                    size='small'
                                    label='Colour'
                                    value={line.colour}
                                    onChange={(e) => setLineDialogDraft((before) => before.map((row, i) => i === index ? { ...row, colour: e.target.value } : row))}
                                    fullWidth
                                    sx={fieldSx}
                                />
                                <IconButton className='admin-icon-button' onClick={() => setLineDialogDraft((before) => before.filter((_, i) => i !== index))}>
                                    <DeleteIcon color='error' />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            className='admin-action-button'
                            variant='outlined'
                            startIcon={<AddCircleIcon />}
                            onClick={() => setLineDialogDraft((before) => [ ...before, createLineDraft() ])}
                        >
                            Add Line
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLineDialogOpen(false)}>Cancel</Button>
                    <Button onClick={saveLineCatalog} variant='contained'>Save</Button>
                </DialogActions>
            </Dialog>
        </AdminPageShell>
    )
}

export default connect(state => ({
    jwt: state.auth.jwt,
}))(TrainStationManage)
