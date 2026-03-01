import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Typography,
} from '@mui/material'

const HANDLE_SIZE = 12
const MIN_NORMALIZED_SIZE = 0.06

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const ensureRect = (rect) => {
    const width = clamp(rect.width ?? 0.25, MIN_NORMALIZED_SIZE, 1)
    const height = clamp(rect.height ?? 0.25, MIN_NORMALIZED_SIZE, 1)
    const x = clamp(rect.x ?? 0.375, 0, 1 - width)
    const y = clamp(rect.y ?? 0.375, 0, 1 - height)
    return { x, y, width, height }
}

const toNormalizedRect = (geometry, naturalWidth, naturalHeight) => {
    if (!naturalWidth || !naturalHeight) {
        return ensureRect({})
    }

    const topLeftX = Number(geometry?.top_left_x || 0)
    const topLeftY = Number(geometry?.top_left_y || 0)
    const bottomRightX = Number(geometry?.bottom_right_x || 0)
    const bottomRightY = Number(geometry?.bottom_right_y || 0)

    const width = Math.max(0, bottomRightX - topLeftX)
    const height = Math.max(0, bottomRightY - topLeftY)

    if (!width || !height) {
        return ensureRect({})
    }

    return ensureRect({
        x: topLeftX / naturalWidth,
        y: topLeftY / naturalHeight,
        width: width / naturalWidth,
        height: height / naturalHeight,
    })
}

const toLegacyGeometry = (rect, naturalWidth, naturalHeight) => {
    const x = Math.round(rect.x * naturalWidth)
    const y = Math.round(rect.y * naturalHeight)
    const width = Math.round(rect.width * naturalWidth)
    const height = Math.round(rect.height * naturalHeight)

    return {
        top_left_x: x,
        top_left_y: y,
        bottom_right_x: x + width,
        bottom_right_y: y + height,
    }
}

const getDraggedRect = (startRect, deltaX, deltaY) => {
    return ensureRect({
        ...startRect,
        x: clamp(startRect.x + deltaX, 0, 1 - startRect.width),
        y: clamp(startRect.y + deltaY, 0, 1 - startRect.height),
    })
}

const getResizedRect = (startRect, handle, deltaX, deltaY) => {
    let nextX = startRect.x
    let nextY = startRect.y
    let nextWidth = startRect.width
    let nextHeight = startRect.height

    if (handle.includes('w')) {
        const right = startRect.x + startRect.width
        nextX = clamp(startRect.x + deltaX, 0, right - MIN_NORMALIZED_SIZE)
        nextWidth = right - nextX
    }

    if (handle.includes('e')) {
        nextWidth = clamp(startRect.width + deltaX, MIN_NORMALIZED_SIZE, 1 - startRect.x)
    }

    if (handle.includes('n')) {
        const bottom = startRect.y + startRect.height
        nextY = clamp(startRect.y + deltaY, 0, bottom - MIN_NORMALIZED_SIZE)
        nextHeight = bottom - nextY
    }

    if (handle.includes('s')) {
        nextHeight = clamp(startRect.height + deltaY, MIN_NORMALIZED_SIZE, 1 - startRect.y)
    }

    return ensureRect({
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
    })
}

const getHandleByPoint = (pointX, pointY, rectPx) => {
    const handles = [
        { key: 'nw', x: rectPx.left, y: rectPx.top },
        { key: 'ne', x: rectPx.right, y: rectPx.top },
        { key: 'sw', x: rectPx.left, y: rectPx.bottom },
        { key: 'se', x: rectPx.right, y: rectPx.bottom },
    ]

    for (const handle of handles) {
        if (Math.abs(pointX - handle.x) <= HANDLE_SIZE && Math.abs(pointY - handle.y) <= HANDLE_SIZE) {
            return handle.key
        }
    }

    return null
}

function PinPlacementCanvas({
    imageSrc,
    geometry,
    iconSrc,
    iconSources = [],
    markerTypes = [],
    selectedTypeId = '',
    onSelectedTypeIdChange,
    onGeometryChange,
}) {
    const hostRef = useRef(null)
    const canvasRef = useRef(null)
    const imageRef = useRef(null)
    const iconCacheRef = useRef(new Map())
    const [ rect, setRect ] = useState(ensureRect({}))
    const [ displaySize, setDisplaySize ] = useState({ width: 0, height: 0 })
    const [ naturalSize, setNaturalSize ] = useState({ width: 0, height: 0 })
    const [ interaction, setInteraction ] = useState(null)
    const [ overlayMode, setOverlayMode ] = useState('square')
    const [ iconStatusMap, setIconStatusMap ] = useState({})

    const canRenderCanvas = !!imageSrc && naturalSize.width > 0 && naturalSize.height > 0
    const canDraw = canRenderCanvas && displaySize.width > 0 && displaySize.height > 0

    const selectedIconStatus = iconSrc ? iconStatusMap[iconSrc] : null

    const canUseIconOverlay = useMemo(() => {
        return overlayMode === 'icon' && !!iconSrc && selectedIconStatus === 'ready'
    }, [overlayMode, iconSrc, selectedIconStatus])
    const effectiveSelectedTypeId = useMemo(() => {
        if (selectedTypeId) return selectedTypeId
        if (!markerTypes.length) return ''
        return String(markerTypes[0].id)
    }, [selectedTypeId, markerTypes])

    useEffect(() => {
        if (overlayMode !== 'icon') return
        if (selectedTypeId) return
        if (!markerTypes.length) return
        onSelectedTypeIdChange && onSelectedTypeIdChange(String(markerTypes[0].id))
    }, [overlayMode, selectedTypeId, markerTypes, onSelectedTypeIdChange])

    useEffect(() => {
        if (!imageSrc) {
            imageRef.current = null
            setNaturalSize({ width: 0, height: 0 })
            return
        }

        const image = new window.Image()
        image.onload = () => {
            imageRef.current = image
            const naturalWidth = image.naturalWidth || image.width
            const naturalHeight = image.naturalHeight || image.height
            setNaturalSize({ width: naturalWidth, height: naturalHeight })
        }
        image.src = imageSrc
    }, [imageSrc])

    useEffect(() => {
        if (!iconSources.length) return

        iconSources.forEach((src) => {
            if (!src || iconCacheRef.current.has(src)) return

            setIconStatusMap((prev) => ({ ...prev, [src]: 'loading' }))

            const icon = new window.Image()
            icon.onload = () => {
                iconCacheRef.current.set(src, icon)
                setIconStatusMap((prev) => ({ ...prev, [src]: 'ready' }))
            }
            icon.onerror = () => {
                setIconStatusMap((prev) => ({ ...prev, [src]: 'error' }))
            }
            icon.src = src
        })
    }, [iconSources])

    useEffect(() => {
        if (!naturalSize.width || !naturalSize.height) return
        setRect(toNormalizedRect(geometry, naturalSize.width, naturalSize.height))
    }, [
        geometry?.top_left_x,
        geometry?.top_left_y,
        geometry?.bottom_right_x,
        geometry?.bottom_right_y,
        naturalSize.width,
        naturalSize.height,
    ])

    useEffect(() => {
        const updateDisplaySize = () => {
            const host = hostRef.current
            if (!host || !naturalSize.width || !naturalSize.height) return

            const maxWidth = Math.min(host.clientWidth, 640)
            const ratio = naturalSize.height / naturalSize.width
            const width = Math.max(260, Math.round(maxWidth))
            const height = Math.round(width * ratio)

            setDisplaySize({ width, height })
        }

        updateDisplaySize()
        window.addEventListener('resize', updateDisplaySize)

        return () => {
            window.removeEventListener('resize', updateDisplaySize)
        }
    }, [naturalSize.width, naturalSize.height])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !canDraw) return

        canvas.width = displaySize.width
        canvas.height = displaySize.height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const image = imageRef.current
        if (!image) return

        ctx.clearRect(0, 0, displaySize.width, displaySize.height)
        ctx.drawImage(image, 0, 0, displaySize.width, displaySize.height)

        const left = rect.x * displaySize.width
        const top = rect.y * displaySize.height
        const rectWidth = rect.width * displaySize.width
        const rectHeight = rect.height * displaySize.height

        const selectedIcon = iconSrc ? iconCacheRef.current.get(iconSrc) : null
        if (canUseIconOverlay && selectedIcon) {
            ctx.drawImage(selectedIcon, left, top, rectWidth, rectHeight)
        } else {
            ctx.fillStyle = 'rgba(54, 153, 255, 0.32)'
            ctx.fillRect(left, top, rectWidth, rectHeight)
        }

        ctx.lineWidth = 2
        ctx.strokeStyle = '#0b4ea2'
        ctx.strokeRect(left, top, rectWidth, rectHeight)

        const handles = [
            [ left, top ],
            [ left + rectWidth, top ],
            [ left, top + rectHeight ],
            [ left + rectWidth, top + rectHeight ],
        ]

        for (const [x, y] of handles) {
            ctx.fillStyle = '#ffffff'
            ctx.strokeStyle = '#0b4ea2'
            ctx.lineWidth = 1.5
            ctx.fillRect(x - HANDLE_SIZE / 2, y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
            ctx.strokeRect(x - HANDLE_SIZE / 2, y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE)
        }
    }, [canDraw, canUseIconOverlay, iconSrc, displaySize.height, displaySize.width, rect])

    const emitGeometry = (nextRect) => {
        if (!naturalSize.width || !naturalSize.height) return
        onGeometryChange && onGeometryChange(toLegacyGeometry(nextRect, naturalSize.width, naturalSize.height))
    }

    const getPointerPosition = (event) => {
        const canvas = canvasRef.current
        if (!canvas) return null
        const bounds = canvas.getBoundingClientRect()
        return {
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        }
    }

    const onPointerDown = (event) => {
        if (!canDraw) return

        const point = getPointerPosition(event)
        if (!point) return

        const rectPx = {
            left: rect.x * displaySize.width,
            top: rect.y * displaySize.height,
            right: (rect.x + rect.width) * displaySize.width,
            bottom: (rect.y + rect.height) * displaySize.height,
        }

        const handle = getHandleByPoint(point.x, point.y, rectPx)
        if (handle) {
            setInteraction({
                mode: 'resize',
                handle,
                startPoint: point,
                startRect: rect,
            })
            event.currentTarget.setPointerCapture(event.pointerId)
            return
        }

        const withinRect = point.x >= rectPx.left
            && point.x <= rectPx.right
            && point.y >= rectPx.top
            && point.y <= rectPx.bottom

        if (withinRect) {
            setInteraction({
                mode: 'drag',
                startPoint: point,
                startRect: rect,
            })
            event.currentTarget.setPointerCapture(event.pointerId)
        }
    }

    const onPointerMove = (event) => {
        if (!interaction || !canDraw) return

        const point = getPointerPosition(event)
        if (!point) return

        const deltaX = (point.x - interaction.startPoint.x) / displaySize.width
        const deltaY = (point.y - interaction.startPoint.y) / displaySize.height

        if (interaction.mode === 'drag') {
            const nextRect = getDraggedRect(interaction.startRect, deltaX, deltaY)
            setRect(nextRect)
            emitGeometry(nextRect)
            return
        }

        if (interaction.mode === 'resize') {
            const nextRect = getResizedRect(interaction.startRect, interaction.handle, deltaX, deltaY)
            setRect(nextRect)
            emitGeometry(nextRect)
        }
    }

    const onPointerUp = (event) => {
        if (interaction) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
        setInteraction(null)
    }

    return (
        <Stack spacing={1.25}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
                <FormControl>
                    <FormLabel id='pin-overlay-mode'>Overlay</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby='pin-overlay-mode'
                        value={overlayMode}
                        onChange={(event) => setOverlayMode(event.target.value)}
                    >
                        <FormControlLabel value='square' control={<Radio />} label='Square' />
                        <FormControlLabel value='icon' control={<Radio />} label='Icon' />
                    </RadioGroup>
                </FormControl>
                <FormControl size='small' sx={{ minWidth: { xs: '100%', md: 260 } }}>
                    <InputLabel id='pin-overlay-type-label'>Marker Type</InputLabel>
                    <Select
                        labelId='pin-overlay-type-label'
                        label='Marker Type'
                        value={effectiveSelectedTypeId}
                        onChange={(event) => onSelectedTypeIdChange && onSelectedTypeIdChange(String(event.target.value))}
                        disabled={overlayMode !== 'icon'}
                    >
                        {markerTypes.map((type) => (
                            <MenuItem key={type.id} value={String(type.id)}>{type.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {overlayMode === 'icon' && (!iconSrc || selectedIconStatus !== 'ready') && (
                    <Typography variant='caption' color='text.secondary'>
                        {selectedIconStatus === 'loading' ? 'Loading marker icon preview.' : 'Icon preview unavailable. Using square overlay.'}
                    </Typography>
                )}
            </Stack>

            <Box
                ref={hostRef}
                sx={{
                    width: '100%',
                    minHeight: 220,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: '#f8fbff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    overflow: 'auto',
                }}
            >
                {canRenderCanvas ? (
                    <canvas
                        ref={canvasRef}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        style={{
                            width: displaySize.width || 260,
                            height: displaySize.height || 260,
                            maxWidth: '100%',
                            touchAction: 'none',
                            cursor: interaction ? 'grabbing' : 'grab',
                            borderRadius: 2,
                        }}
                    />
                ) : (
                    <Stack spacing={1} alignItems='center'>
                        <Typography variant='body2' color='text.secondary'>
                            Upload a pin image to enable canvas editing.
                        </Typography>
                        <Button variant='outlined' disabled>
                            Canvas Ready
                        </Button>
                    </Stack>
                )}
            </Box>

            <Typography variant='caption' color='text.secondary'>
                Drag inside the selection to move. Drag corner handles to resize.
            </Typography>
        </Stack>
    )
}

export default PinPlacementCanvas

export {
    toNormalizedRect,
    toLegacyGeometry,
    getDraggedRect,
    getResizedRect,
}
