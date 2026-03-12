import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    Box,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    FormControl,
    FormLabel,
} from '@mui/material'
import AddLinkIcon from '@mui/icons-material/AddLink'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import DeleteIcon from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'
import BlockIcon from '@mui/icons-material/Block'
import backend from '../../../constant/backend'

function ImageSquarePicker({
    imageInfo,
    message,
    onOpenLink,
    onUploadFile,
    onCancelImage,
    title,
}) {
    const inputRef = useRef(null)
    const [ anchorEl, setAnchorEl ] = useState(null)

    const previewSrc = useMemo(() => {
        if (!imageInfo) return ''
        if (imageInfo.type === 'existing') {
            const raw = `${imageInfo.value || ''}`.trim()
            if (!raw) return ''
            if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw
            return `${backend.IMAGE_LINK}${raw}`
        }
        if (imageInfo.type === 'weblink') return imageInfo.value || ''
        if (imageInfo.type === 'upload' && imageInfo.value instanceof File) {
            return URL.createObjectURL(imageInfo.value)
        }
        return ''
    }, [imageInfo])

    useEffect(() => (
        () => {
            if (imageInfo?.type === 'upload' && previewSrc) {
                URL.revokeObjectURL(previewSrc)
            }
        }
    ), [imageInfo, previewSrc])

    const openMenu = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const closeMenu = () => {
        setAnchorEl(null)
    }

    return (
        <FormControl component='image' fullWidth>
            <FormLabel component='legend'>{title || 'Preview'}</FormLabel>
            <Button
                variant='outlined'
                onClick={openMenu}
                sx={{
                    width: '100%',
                    minWidth: 0,
                    aspectRatio: '1 / 1',
                    borderRadius: 1.5,
                    backgroundColor: '#ffffff',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 0.5,
                    textTransform: 'none',
                    p: 0,
                }}
            >
                {previewSrc ? (
                    <Box
                        component='img'
                        src={previewSrc}
                        alt='Marker preview'
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <>
                        <BlockIcon sx={{ color: 'error.main', fontSize: 36 }} />
                        <span style={{ fontSize: '11px', lineHeight: 1.2 }}>Unset</span>
                    </>
                )}
            </Button>
            <FormLabel>{message}</FormLabel>

            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
                <MenuItem
                    onClick={() => {
                        closeMenu()
                        onOpenLink && onOpenLink()
                    }}
                >
                    <ListItemIcon><AddLinkIcon fontSize='small' /></ListItemIcon>
                    <ListItemText>Link</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        closeMenu()
                        inputRef.current?.click()
                    }}
                >
                    <ListItemIcon><InsertDriveFileIcon fontSize='small' /></ListItemIcon>
                    <ListItemText>Upload</ListItemText>
                </MenuItem>
                {imageInfo ? (
                    <MenuItem
                        onClick={() => {
                            closeMenu()
                            onCancelImage && onCancelImage()
                        }}
                    >
                        <ListItemIcon><DeleteIcon fontSize='small' /></ListItemIcon>
                        <ListItemText>Cancel</ListItemText>
                    </MenuItem>
                ) : null}
            </Menu>

            <input
                ref={inputRef}
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && onUploadFile) onUploadFile(file)
                    e.target.value = ''
                }}
            />
        </FormControl>
    )
}

export default ImageSquarePicker
