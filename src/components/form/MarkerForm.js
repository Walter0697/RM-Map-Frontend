import React, { useState, useEffect, useCallback, useRef } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    Box,
    Stack,
    TextField,
    Button,
    ButtonGroup,
    FormControl,
    FormLabel,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material'

import AddLinkIcon from '@mui/icons-material/AddLink'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RiceBowlIcon from '@mui/icons-material/RiceBowl'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RamenDiningIcon from '@mui/icons-material/RamenDining'

import useObject from '../../hooks/useObject'

import BaseForm from './BaseForm'
import ScrapperForm from './ScrapperForm'
import ImageLinkValidate from './image/ImageLinkValidate'
import ImagePreview from './image/ImagePreview'
import Selectable from '../field/Selectable'
import NullableDatePicker from '../field/NullableDatePicker'

import generic from '../../scripts/generic'
import scrapper from '../../scripts/scrapper'
import image from '../../scripts/image'
import actions from '../../store/actions'
import graphql from '../../graphql'

function MarkerForm({
    open,
    handleClose,
    onCreated,
    location,
    eventtypes,
    dispatch,
}) {
    const [ createMarkerGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.markers.create, { errorPolicy: 'all' })
    const [ scrapimageGQL, { data: scrapImageData, loading: scrapImageLoading, error: scrapImageError } ] = useLazyQuery(graphql.helpers.webscrap)

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        address: '',
        imageLink: false,
        link: '',
        type: '',  
        description: '', 
        estimate_time: '',
        price: '',
        need_booking: false,
        permanent:  false,
        from_time: null,
        to_time: null,    
    })
    const [ websiteLink, setWebsiteLink ] = useState('')
    const [ error, setError ] = useObject({})

    const [ imageFormState , setImageState ] = useState('') // weblink, preview, scrap
    const [ imageSubmitMessage, setImageMessage ] = useState('')

    // storing the image information, to determined if it is using the compressed one, or the original one
    let rawImageCaches = {}
    const [ imageCache, setImageCache ] = useState({})
    const [ imageVersion, setImageVersion ] = useState(null)
    const uploadInputRef = useRef(null)

    const [ copiedValue, setCopiedValue ] = useState('')
    const [ scrapperData, setScrapperData ] = useState(null) 
    const [ scrapperOpen, setScrapperOpen ] = useState(null)

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)

    // menu for website
    const [ anchorEl, setAnchorEl ] = useState(null)
    const menuOpen = Boolean(anchorEl)

    useEffect(() => {
        if (!location) return

        // if location updated, reset everything inside the form
        setSubmitting(false)
        setScrapperData(null)
        resetFormValue()
        setImageMessage('')
        setImageState('')
        setUnauthorized(false)
        setWebsiteLink('')
        setImageCache({})
        rawImageCaches = {}
        setImageVersion(null)

        if (location.address) {
            setFormValue('address', location.address)
        }

        if (location.name) {
            setFormValue('label', location.name)
        }
        
        // check if clipboard has anything that is scrabble
        getClipboardMessage()
    }, [location, open])

    useEffect(() => {
        if (createError) {
            setAlertMessage({
                type: 'error',
                message: createError.message,
            })
            setSubmitting(false)
        }

        if (createData) {
            dispatch(actions.addMarker(createData.createMarker))
            onCreated && onCreated()
        }
    }, [createData, createError])

    useEffect(() => {
        if (scrapImageLoading) return
        let imageSet = false
        if (scrapImageData) {
            if (scrapImageData.scrapimage.image_link) {
                if (!formValue.imageLink) {
                    setFormValue('imageLink', {
                        type: 'weblink',
                        value: scrapImageData.scrapimage.image_link,
                    })
                    setImageState('scrap')
                    setImageMessage('image by scrapping website')
                    imageSet = true
                }
            }

            if (!imageSet) {
                if (imageSubmitMessage === 'scrapping image from website...') {
                    setImageMessage('')
                }
            }

            if (scrapImageData.scrapimage.title) {
                if (!formValue.label) {
                    setFormValue('label', scrapImageData.scrapimage.title)
                }
            }
        }
    }, [scrapImageData, scrapImageLoading])

    const getClipboardMessage = async () => {
        if (!navigator?.clipboard?.readText) {
            return
        }
        let text = ''
        try {
            text = await navigator.clipboard.readText()
        } catch (error) {
            return
        }
        const info = scrapper.validate(text)
        if (info) {
            if (confirm(`we detected that your clipboard has information for ${info}. Do you want to use it for this marker?`)) {
                setCopiedValue(text)
                setScrapperOpen(info)
            }
        }
    }

    const scrapImageWithLink = useCallback(() => {
        if (!open) return
        if (!websiteLink) return
        if (!formValue.imageLink) {
            setImageMessage('scrapping image from website...')
        }

        scrapimageGQL({ variables: { link: websiteLink }})
    }, [ open, websiteLink, formValue.imageLink ])

    //useDebounce(scrapImageWithLink, 2000, [ websiteLink, formValue.imageLink, open ])

    const onValueChangeHandler = (field, value) => {
        if (field === 'link') {
            setWebsiteLink(value)
        }
        setFormValue(field, value)
        setError(field, '')
    }

    const onImageLinkChangeHandler = (link) => {
        setFormValue('imageLink', {
            type: 'weblink',
            value: link,
        })
        setImageMessage('image from the internet')
    }

    const chooseImageVersion = (selected) => {
        const target = imageCache[selected]
        setFormValue('imageLink', {
            type: 'upload',
            value: target.data,
            name: target.data.name,
        })
        setImageVersion(selected)
    }

    const handleCompressedImage = (result) => {
        setFormValue('imageLink', {
            type: 'upload',
            value: result,
            name: result.name
        })
        setImageVersion('compressed')
        const caches = Object.assign({}, rawImageCaches)
        caches['compressed'] = {
            size: result.size,
            data: result,
        }
        rawImageCaches = caches
        setImageCache(caches)
    }

    // handle image upload
    const handleImageChange = (e) => {
        if (e.target.files.length) {
            const fileValue = e.target.files[0]
            const isImage = image.compress.isImage(fileValue)
            if (!isImage) return
            setImageMessage('image from user upload')
            setFormValue('imageLink', {
                type: 'upload',
                value: e.target.files[0],
                name: e.target.files[0].name,
            })
            setImageVersion('original')
            const caches = Object.assign({}, rawImageCaches)
            caches['original'] = {
                size: e.target.files[0].size,
                data: e.target.files[0],
            }
            rawImageCaches = caches
            setImageCache(caches)
            const sc = image.compress.shouldCompress(fileValue)
            if (sc) {
                image.compress.compressImage(fileValue).then(result => {
                    handleCompressedImage(result)
                })
            }
            
        }
    }

    const removeImage = () => {
        setFormValue('imageLink', null)
        setImageMessage('')
    }

    const removeScrapperData = () => {
        setScrapperData(null)
    }

    const onScrapperClick = (value) => {
        setScrapperOpen(value)
        setAnchorEl(null)
    }

    const onScrapperFinish = (link, value) => {
        setFormValue('link', link)
        setError('link', '')
        setScrapperData(value)
        setScrapperOpen(false)
        setWebsiteLink(link)
    }

    // handle menu click
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        let hasError = false

        if (formValue.label === '') {
            setError('label', 'label cannot be empty')
            hasError = true
        }

        if (formValue.type === '') {
            setError('type', 'type cannot be empty')
            hasError = true
        }

        if (hasError) {
            setSubmitting(false)
            return
        }

        const to = formValue.to_time ? generic.time.toServerFormat(formValue.to_time) : null
        const from = formValue.from_time ? generic.time.toServerFormat(formValue.from_time) : null
        const restaurant_id = (scrapperData && scrapperData.restaurant) ? scrapperData.restaurant.id: null

        createMarkerGQL({ variables: {
            label: formValue.label,
            type: formValue.type,
            latitude: location.latlon.lat.toString(),
            longitude: location.latlon.lon.toString(),
            address: formValue.address,
            link: formValue.link,
            image_link: (formValue.imageLink && formValue.imageLink.type === 'weblink') ? formValue.imageLink.value : null,
            image_upload: (formValue.imageLink && formValue.imageLink.type === 'upload') ? formValue.imageLink.value : null,
            description: formValue.description,
            estimate_time: formValue.estimate_time,
            price: formValue.price,
            need_booking: formValue.need_booking,
            permanent: formValue.permanent,
            to_time: to,
            from_time: from,
            restaurant_id: restaurant_id,
        }})
    }

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={'Create Marker'}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Create'}
                loading={submitting}
                isSubmitUnauthorized={isUnauthorized}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
            >
                <Stack spacing={2}>
                    <TextField
                        variant='outlined'
                        fullWidth
                        required
                        label='label'
                        value={formValue.label}
                        onChange={(e) => onValueChangeHandler('label', e.target.value)}
                        error={!!error.label}
                        helperText={error.label}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            InputLabelProps={{ shrink: true }}
                            variant='outlined'
                            size='small'
                            fullWidth
                            label='longitude'
                            value={location ? location.latlon.lon : ''}
                            disabled
                        />
                        <TextField
                            InputLabelProps={{ shrink: true }}
                            variant='outlined'
                            size='small'
                            fullWidth
                            label='latitude'
                            value={location ? location.latlon.lat : ''}
                            disabled
                        />
                    </Box>
                    <Selectable
                        label='type'
                        required
                        value={formValue.type}
                        onValueChange={(e) => onValueChangeHandler('type', e.target.value)}
                        defaultSelectaValue={''}
                        defaultSelectText={''}
                        errorMessage={error.type}
                        list={eventtypes}
                        valueKey={'value'}
                        textKey={'label'}
                    />
                    <TextField
                        InputLabelProps={{ shrink: !!formValue.address }}
                        variant='outlined'
                        fullWidth
                        required
                        label='address'
                        value={formValue.address}
                        onChange={(e) => onValueChangeHandler('address', e.target.value)}
                        error={!!error.address}
                        helperText={error.address}
                    />
                    <Stack spacing={0}>
                        <Box sx={{ display: 'flex' }}>
                            <Box sx={{ flex: 9 }}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    label='website'
                                    value={formValue.link}
                                    onChange={(e) => onValueChangeHandler('link', e.target.value)}
                                    error={!!error.link}
                                    helperText={error.link}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Button
                                    variant='outlined'
                                    id='website-menu-button'
                                    aria-controls={menuOpen ? 'website-menu' : undefined}
                                    aria-haspopup='true'
                                    aria-expanded={menuOpen ? 'true' : undefined}
                                    onClick={handleMenuClick}
                                    fullWidth
                                    sx={{
                                        minWidth: 0,
                                        height: '100%',
                                        borderLeft: 0,
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0,
                                    }}
                                >
                                    <MoreVertIcon />
                                </Button>
                            </Box>
                        </Box>
                        <Button
                            variant='outlined'
                            disabled={!websiteLink}
                            onClick={() => scrapImageWithLink()}
                            fullWidth
                            sx={{
                                mt: 0,
                                borderTop: 0,
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                            }}
                        >
                            FETCH DATA
                        </Button>
                        {scrapperData?.restaurant && (
                            <Box
                                sx={{ color: 'error.main', cursor: 'pointer' }}
                                onClick={removeScrapperData}
                            >
                                <DeleteIcon sx={{ verticalAlign: 'middle', display: 'inline-block', fontSize: '18px' }}/>
                                <span style={{ verticalAlign: 'middle', display: 'inline-block' }}>Remove Restaurant Data</span>
                            </Box>
                        )}
                        <Menu
                            id='website-menu'
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            MenuListProps={{
                                'aria-labelledby': 'website-menu-button',
                            }}
                        >
                            <MenuItem onClick={() => onScrapperClick('openrice')}>
                                <ListItemIcon>
                                    <RiceBowlIcon fontSize='small' />
                                </ListItemIcon>
                                <ListItemText>Openrice</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => onScrapperClick('yelp')}>
                                <ListItemIcon>
                                    <StorefrontIcon fontSize='small' />
                                </ListItemIcon>
                                <ListItemText>Yelp</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => onScrapperClick('tabelog')}>
                                <ListItemIcon>
                                    <RamenDiningIcon fontSize='small' />
                                </ListItemIcon>
                                <ListItemText>Tabelog</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Stack>
                    <FormControl component='image' fullWidth>
                        <FormLabel component='legend'>Preview</FormLabel>
                        <FormLabel>{imageSubmitMessage}</FormLabel>
                        <ButtonGroup fullWidth variant='outlined'>
                            <Button onClick={() => setImageState('weblink')}>
                                <AddLinkIcon />
                            </Button>
                            <Button onClick={() => uploadInputRef.current?.click()}>
                                <InsertDriveFileIcon />
                            </Button>
                            <Button disabled={!formValue.imageLink} onClick={() => setImageState('preview')}>
                                <VisibilityIcon />
                            </Button>
                        </ButtonGroup>
                        <input ref={uploadInputRef} type='file' style={{ display: 'none' }} onChange={handleImageChange} />
                        <FormLabel>
                            {formValue.imageLink && (
                                <div
                                    style={{ color: 'red' }}
                                    onClick={removeImage}
                                >
                                    <DeleteIcon sx={{ verticalAlign: 'middle', display: 'inline-block', fontSize: '18px' }}/>
                                    <span style={{ verticalAlign: 'middle', display: 'inline-block' }}>Remove Image</span>
                                </div>
                            )}
                        </FormLabel>
                    </FormControl>
                    <TextField
                        variant='outlined'
                        fullWidth
                        label='description'
                        value={formValue.description}
                        onChange={(e) => onValueChangeHandler('description', e.target.value)}
                        error={!!error.description}
                        helperText={error.description}
                    />
                    <Selectable
                        label='estimate time'
                        value={formValue.estimate_time}
                        onValueChange={(e) => onValueChangeHandler('estimate_time', e.target.value)}
                        defaultSelectaValue={''}
                        defaultSelectText={''}
                        errorMessage={''}
                        list={[
                            { value: 'short', label: 'Short' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'long', label: 'Long' },
                        ]}
                        valueKey={'value'}
                        textKey={'label'}
                    />
                    <Selectable
                        label='pricing'
                        value={formValue.price}
                        onValueChange={(e) => onValueChangeHandler('price', e.target.value)}
                        defaultSelectaValue={''}
                        defaultSelectText={''}
                        errorMessage={''}
                        list={[
                            { value: 'free', label: 'Free' },
                            { value: 'cheap', label: 'Cheap $' },
                            { value: 'middle', label: 'Middle $$' },
                            { value: 'expensive', label: 'Expensive $$$'},
                        ]}
                        valueKey={'value'}
                        textKey={'label'}
                    />
                    <NullableDatePicker
                        label={'from'}
                        value={formValue.from_time}
                        onValueChange={(e) => onValueChangeHandler('from_time', e)}
                        errorMessage={error.from_time}
                    />
                    <NullableDatePicker
                        noPast
                        label={'to'}
                        value={formValue.to_time}
                        onValueChange={(e) => onValueChangeHandler('to_time', e)}
                        errorMessage={error.to_time}
                    />
                    <Selectable
                        label='permanent'
                        value={formValue.permanent}
                        onValueChange={(e) => onValueChangeHandler('permanent', e.target.value)}
                        noDefault
                        errorMessage={''}
                        list={[
                            { value: false, label: 'no' },
                            { value: true, label: 'yes' },
                        ]}
                        valueKey={'value'}
                        textKey={'label'}
                    />
                    <Selectable
                        label='need booking'
                        value={formValue.need_booking}
                        onValueChange={(e) => onValueChangeHandler('need_booking', e.target.value)}
                        noDefault
                        errorMessage={''}
                        list={[
                            { value: false, label: 'no' },
                            { value: true, label: 'yes' },
                        ]}
                        valueKey={'value'}
                        textKey={'label'}
                    />
                </Stack>
            </BaseForm>
            <ImageLinkValidate 
                shouldOpen={imageFormState === 'weblink'}
                handleClose={() => setImageState('')}
                imageLink={(formValue.imageLink && formValue.imageLink.type === 'weblink') ? formValue.imageLink.value : ''}
                setImageLink={onImageLinkChangeHandler}
            />
            <ImagePreview
                shouldOpen={imageFormState === 'preview'}
                handleClose={() => setImageState('')}
                imageInfo={formValue.imageLink}
                imageVersion={imageVersion}
                chooseImageVersion={chooseImageVersion}
                imageCache={imageCache}
            />
            <ScrapperForm 
                open={!!scrapperOpen}
                handleClose={() => setScrapperOpen(null)}
                copied_value={copiedValue}
                source={scrapperOpen}
                value={scrapperData}
                setValue={onScrapperFinish}
            />
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(MarkerForm)
