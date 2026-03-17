import React, { useState, useEffect, useCallback } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    Box,
    Stack,
    TextField,
    Button,
    FormControl,
    FormLabel,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import TimelapseIcon from '@mui/icons-material/Timelapse'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PaidIcon from '@mui/icons-material/Paid'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import HomeIcon from '@mui/icons-material/Home'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import CategoryIcon from '@mui/icons-material/Category'
import ImageIcon from '@mui/icons-material/Image'
import RiceBowlIcon from '@mui/icons-material/RiceBowl'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RamenDiningIcon from '@mui/icons-material/RamenDining'

import useObject from '../../hooks/useObject'

import BaseForm from './BaseForm'
import ScrapperForm from './ScrapperForm'
import ImageLinkValidate from './image/ImageLinkValidate'
import ImageSquarePicker from './image/ImageSquarePicker'
import NullableDatePicker from '../field/NullableDatePicker'

import generic from '../../scripts/generic'
import scrapper from '../../scripts/scrapper'
import image from '../../scripts/image'
import actions from '../../store/actions'
import graphql from '../../graphql'
import backend from '../../constant/backend'

function MarkerForm({
    open,
    handleClose,
    onCreated,
    location,
    eventtypes,
    dispatch,
}) {
    const theme = useTheme()
    const isDesktopWeb = useMediaQuery(theme.breakpoints.up('lg'))
    const [ createMarkerGQL, { data: createData, loading: createLoading, error: createError } ] = useMutation(graphql.markers.create, { errorPolicy: 'all' })
    const [ scrapimageGQL, { data: scrapImageData, loading: scrapImageLoading, error: scrapImageError } ] = useLazyQuery(graphql.helpers.webscrap)

    const [ formValue, setFormValue, resetFormValue ] = useObject({
        label: '',
        address: '',
        imageLink: false,
        link: '',
        social_media_link: '',
        type: '',  
        description: '', 
        estimate_time: '',
        price: '',
        need_booking: '',
        permanent:  '',
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

    const [ copiedValue, setCopiedValue ] = useState('')
    const [ scrapperData, setScrapperData ] = useState(null) 
    const [ scrapperOpen, setScrapperOpen ] = useState(null)

    const [ submitting, setSubmitting ] = useState(false)
    const [ isUnauthorized, setUnauthorized ] = useState(false)

    const [ alertMessage, setAlertMessage ] = useState(null)


    // menu for website
    const [ anchorEl, setAnchorEl ] = useState(null)
    const menuOpen = Boolean(anchorEl)
    const [ estimateAnchorEl, setEstimateAnchorEl ] = useState(null)
    const [ pricingAnchorEl, setPricingAnchorEl ] = useState(null)
    const [ permanentAnchorEl, setPermanentAnchorEl ] = useState(null)
    const [ bookingAnchorEl, setBookingAnchorEl ] = useState(null)
    const [ typeAnchorEl, setTypeAnchorEl ] = useState(null)

    const estimateOptions = [
        { value: '', label: 'Unset', icon: <BlockIcon sx={{ color: 'error.main', fontSize: 22 }} /> },
        { value: 'short', label: 'Short', icon: <FlashOnIcon sx={{ fontSize: 22 }} /> },
        { value: 'medium', label: 'Medium', icon: <TimelapseIcon sx={{ fontSize: 22 }} /> },
        { value: 'long', label: 'Long', icon: <HourglassBottomIcon sx={{ fontSize: 22 }} /> },
    ]

    const pricingOptions = [
        { value: '', label: 'Unset', icon: <BlockIcon sx={{ color: 'error.main', fontSize: 22 }} /> },
        { value: 'free', label: 'Free', icon: <MoneyOffIcon sx={{ fontSize: 22 }} /> },
        { value: 'cheap', label: 'Cheap $', icon: <AttachMoneyIcon sx={{ fontSize: 22 }} /> },
        { value: 'middle', label: 'Middle $$', icon: <PaidIcon sx={{ fontSize: 22 }} /> },
        { value: 'expensive', label: 'Expensive $$$', icon: <CurrencyExchangeIcon sx={{ fontSize: 22 }} /> },
    ]

    const selectedEstimateOption = estimateOptions.find((item) => item.value === formValue.estimate_time) || estimateOptions[0]
    const selectedPricingOption = pricingOptions.find((item) => item.value === formValue.price) || pricingOptions[0]
    const yesNoOptions = [
        { value: '', label: 'Unset', icon: <BlockIcon sx={{ color: 'error.main', fontSize: 22 }} /> },
        { value: false, label: 'No', icon: <CancelIcon sx={{ fontSize: 22 }} /> },
        { value: true, label: 'Yes', icon: <CheckCircleIcon sx={{ fontSize: 22 }} /> },
    ]
    const selectedPermanentOption = yesNoOptions.find((item) => item.value === formValue.permanent) || yesNoOptions[0]
    const selectedBookingOption = yesNoOptions.find((item) => item.value === formValue.need_booking) || yesNoOptions[0]
    const selectedTypeOption = eventtypes.find((item) => item.value === formValue.type) || null

    const getTypeIconSrc = (item) => {
        const raw = `${item?.icon_path || ''}`.trim()
        if (!raw) return ''
        if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw
        return `${backend.IMAGE_LINK}${raw}`
    }

    const format5Sig = (value) => {
        const n = Number(value)
        if (Number.isNaN(n)) return ''
        return n.toPrecision(5)
    }

    const footerLatLon = (
        <Box
            sx={{
                fontSize: '12px',
                color: 'text.secondary',
                whiteSpace: 'nowrap',
            }}
        >
            {location ? `${format5Sig(location.latlon.lat)}, ${format5Sig(location.latlon.lon)}` : ''}
        </Box>
    )

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
            setImageMessage('the internet...')
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
        setImageMessage('the internet')
    }

    const handleCompressedImage = (result) => {
        setFormValue('imageLink', {
            type: 'upload',
            value: result,
            name: result.name
        })
        const caches = Object.assign({}, rawImageCaches)
        caches['compressed'] = {
            size: result.size,
            data: result,
        }
        rawImageCaches = caches
        setImageCache(caches)
    }

    // handle image upload
    const handleImageFile = (fileValue) => {
        if (!fileValue) return
        const isImage = image.compress.isImage(fileValue)
        if (!isImage) return
        setImageMessage('user upload')
        setFormValue('imageLink', {
            type: 'upload',
            value: fileValue,
            name: fileValue.name,
        })
        const caches = Object.assign({}, rawImageCaches)
        caches['original'] = {
            size: fileValue.size,
            data: fileValue,
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
            social_media_link: formValue.social_media_link,
            image_link: (formValue.imageLink && formValue.imageLink.type === 'weblink') ? formValue.imageLink.value : null,
            image_upload: (formValue.imageLink && formValue.imageLink.type === 'upload') ? formValue.imageLink.value : null,
            description: formValue.description,
            estimate_time: formValue.estimate_time,
            price: formValue.price,
            need_booking: formValue.need_booking === '' ? false : formValue.need_booking,
            permanent: formValue.permanent === '' ? false : formValue.permanent,
            to_time: to,
            from_time: from,
            restaurant_id: restaurant_id,
            social_media_link: formValue.social_media_link,
        }})
    }

    const onFormKeyDownHandler = (e) => {
        // Prevent accidental dialog submit from Enter on single-line inputs.
        if (e.key === 'Enter' && e.target?.tagName !== 'TEXTAREA') {
            e.preventDefault()
        }
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
                footerStart={footerLatLon}
            >
                <Stack spacing={2} onKeyDown={onFormKeyDownHandler}>
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
                    {isDesktopWeb ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                                gap: 2,
                                alignItems: 'flex-start',
                            }}
                        >
                            <FormControl sx={{ minWidth: 0 }}>
                                <FormLabel component='legend'>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                        <CategoryIcon sx={{ fontSize: 14 }} />
                                        <span>marker type</span>
                                    </Box>
                                </FormLabel>
                                <Button
                                    variant='outlined'
                                    onClick={(event) => setTypeAnchorEl(event.currentTarget)}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        minWidth: 0,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.75,
                                        textTransform: 'none',
                                        borderColor: error.type ? 'error.main' : undefined,
                                    }}
                                >
                                    {selectedTypeOption ? (
                                        <Box
                                            component='img'
                                            src={getTypeIconSrc(selectedTypeOption)}
                                            alt=''
                                            sx={{ width: 40, height: 40, objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <BlockIcon sx={{ color: 'error.main', fontSize: 36 }} />
                                    )}
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                        {selectedTypeOption?.label || 'Unset'}
                                    </span>
                                </Button>
                                {error.type ? (
                                    <FormLabel sx={{ color: 'error.main', mt: 0.5 }}>{error.type}</FormLabel>
                                ) : null}
                                <Menu
                                    anchorEl={typeAnchorEl}
                                    open={!!typeAnchorEl}
                                    onClose={() => setTypeAnchorEl(null)}
                                >
                                    {eventtypes.map((option) => (
                                        <MenuItem
                                            key={`type-${option.value}`}
                                            onClick={() => {
                                                onValueChangeHandler('type', option.value)
                                                setTypeAnchorEl(null)
                                            }}
                                        >
                                            <ListItemIcon>
                                                <Box
                                                    component='img'
                                                    src={getTypeIconSrc(option)}
                                                    alt=''
                                                    sx={{ width: 20, height: 20, objectFit: 'contain' }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText>{option.label}</ListItemText>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </FormControl>
                            <Box sx={{ minWidth: 0 }}>
                                <ImageSquarePicker
                                    title={(
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                            <ImageIcon sx={{ fontSize: 14 }} />
                                            <span>image</span>
                                        </Box>
                                    )}
                                    imageInfo={formValue.imageLink}
                                    message={imageSubmitMessage}
                                    onOpenLink={() => setImageState('weblink')}
                                    onUploadFile={handleImageFile}
                                    onCancelImage={removeImage}
                                />
                            </Box>
                            <FormControl sx={{ minWidth: 0 }}>
                                <FormLabel component='legend'>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                                        <span>estimate time</span>
                                    </Box>
                                </FormLabel>
                                <Button
                                    variant='outlined'
                                    onClick={(event) => setEstimateAnchorEl(event.currentTarget)}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        minWidth: 0,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        textTransform: 'none',
                                        '& .MuiSvgIcon-root': { fontSize: 36 },
                                    }}
                                >
                                    {selectedEstimateOption.icon}
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                        {selectedEstimateOption.label}
                                    </span>
                                </Button>
                                <Menu
                                    anchorEl={estimateAnchorEl}
                                    open={!!estimateAnchorEl}
                                    onClose={() => setEstimateAnchorEl(null)}
                                >
                                    {estimateOptions.map((option) => (
                                        <MenuItem
                                            key={`estimate-${option.value || 'unset'}`}
                                            onClick={() => {
                                                onValueChangeHandler('estimate_time', option.value)
                                                setEstimateAnchorEl(null)
                                            }}
                                        >
                                            <ListItemIcon>{option.icon}</ListItemIcon>
                                            <ListItemText>{option.label}</ListItemText>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </FormControl>
                            <FormControl sx={{ minWidth: 0 }}>
                                <FormLabel component='legend'>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                        <LocalOfferIcon sx={{ fontSize: 14 }} />
                                        <span>pricing</span>
                                    </Box>
                                </FormLabel>
                                <Button
                                    variant='outlined'
                                    onClick={(event) => setPricingAnchorEl(event.currentTarget)}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        minWidth: 0,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        textTransform: 'none',
                                        '& .MuiSvgIcon-root': { fontSize: 36 },
                                    }}
                                >
                                    {selectedPricingOption.icon}
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                        {selectedPricingOption.label}
                                    </span>
                                </Button>
                                <Menu
                                    anchorEl={pricingAnchorEl}
                                    open={!!pricingAnchorEl}
                                    onClose={() => setPricingAnchorEl(null)}
                                >
                                    {pricingOptions.map((option) => (
                                        <MenuItem
                                            key={`price-${option.value || 'unset'}`}
                                            onClick={() => {
                                                onValueChangeHandler('price', option.value)
                                                setPricingAnchorEl(null)
                                            }}
                                        >
                                            <ListItemIcon>{option.icon}</ListItemIcon>
                                            <ListItemText>{option.label}</ListItemText>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </FormControl>
                            <FormControl sx={{ minWidth: 0 }}>
                                <FormLabel component='legend'>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                        <HomeIcon sx={{ fontSize: 14 }} />
                                        <span>permanent</span>
                                    </Box>
                                </FormLabel>
                                <Button
                                    variant='outlined'
                                    onClick={(event) => setPermanentAnchorEl(event.currentTarget)}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        minWidth: 0,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        textTransform: 'none',
                                        '& .MuiSvgIcon-root': { fontSize: 36 },
                                    }}
                                >
                                    {selectedPermanentOption.icon}
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                        {selectedPermanentOption.label}
                                    </span>
                                </Button>
                                <Menu
                                    anchorEl={permanentAnchorEl}
                                    open={!!permanentAnchorEl}
                                    onClose={() => setPermanentAnchorEl(null)}
                                >
                                    {yesNoOptions.map((option) => (
                                        <MenuItem
                                            key={`permanent-${String(option.value) || 'unset'}`}
                                            onClick={() => {
                                                onValueChangeHandler('permanent', option.value)
                                                setPermanentAnchorEl(null)
                                            }}
                                        >
                                            <ListItemIcon>{option.icon}</ListItemIcon>
                                            <ListItemText>{option.label}</ListItemText>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </FormControl>
                            <FormControl sx={{ minWidth: 0 }}>
                                <FormLabel component='legend'>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                        <EventAvailableIcon sx={{ fontSize: 14 }} />
                                        <span>need booking</span>
                                    </Box>
                                </FormLabel>
                                <Button
                                    variant='outlined'
                                    onClick={(event) => setBookingAnchorEl(event.currentTarget)}
                                    sx={{
                                        width: '100%',
                                        aspectRatio: '1 / 1',
                                        minWidth: 0,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        textTransform: 'none',
                                        '& .MuiSvgIcon-root': { fontSize: 36 },
                                    }}
                                >
                                    {selectedBookingOption.icon}
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                        {selectedBookingOption.label}
                                    </span>
                                </Button>
                                <Menu
                                    anchorEl={bookingAnchorEl}
                                    open={!!bookingAnchorEl}
                                    onClose={() => setBookingAnchorEl(null)}
                                >
                                    {yesNoOptions.map((option) => (
                                        <MenuItem
                                            key={`booking-${String(option.value) || 'unset'}`}
                                            onClick={() => {
                                                onValueChangeHandler('need_booking', option.value)
                                                setBookingAnchorEl(null)
                                            }}
                                        >
                                            <ListItemIcon>{option.icon}</ListItemIcon>
                                            <ListItemText>{option.label}</ListItemText>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </FormControl>
                        </Box>
                    ) : (
                    <>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <FormControl sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel component='legend'>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                    <CategoryIcon sx={{ fontSize: 14 }} />
                                    <span>marker type</span>
                                </Box>
                            </FormLabel>
                            <Button
                                variant='outlined'
                                onClick={(event) => setTypeAnchorEl(event.currentTarget)}
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1 / 1',
                                    minWidth: 0,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.75,
                                    textTransform: 'none',
                                    borderColor: error.type ? 'error.main' : undefined,
                                }}
                            >
                                {selectedTypeOption ? (
                                    <Box
                                        component='img'
                                        src={getTypeIconSrc(selectedTypeOption)}
                                        alt=''
                                        sx={{ width: 40, height: 40, objectFit: 'contain' }}
                                    />
                                ) : (
                                    <BlockIcon sx={{ color: 'error.main', fontSize: 36 }} />
                                )}
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                    {selectedTypeOption?.label || 'Unset'}
                                </span>
                            </Button>
                            {error.type ? (
                                <FormLabel sx={{ color: 'error.main', mt: 0.5 }}>{error.type}</FormLabel>
                            ) : null}
                            <Menu
                                anchorEl={typeAnchorEl}
                                open={!!typeAnchorEl}
                                onClose={() => setTypeAnchorEl(null)}
                            >
                                {eventtypes.map((option) => (
                                    <MenuItem
                                        key={`type-${option.value}`}
                                        onClick={() => {
                                            onValueChangeHandler('type', option.value)
                                            setTypeAnchorEl(null)
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Box
                                                component='img'
                                                src={getTypeIconSrc(option)}
                                                alt=''
                                                sx={{ width: 20, height: 20, objectFit: 'contain' }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText>{option.label}</ListItemText>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </FormControl>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <ImageSquarePicker
                                title={(
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                        <ImageIcon sx={{ fontSize: 14 }} />
                                        <span>image</span>
                                    </Box>
                                )}
                                imageInfo={formValue.imageLink}
                                message={imageSubmitMessage}
                                onOpenLink={() => setImageState('weblink')}
                                onUploadFile={handleImageFile}
                                onCancelImage={removeImage}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <FormControl sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel component='legend'>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                                    <span>estimate time</span>
                                </Box>
                            </FormLabel>
                            <Button
                                variant='outlined'
                                onClick={(event) => setEstimateAnchorEl(event.currentTarget)}
                                sx={{
                                    width: '100%',
                                    height: 92,
                                    minWidth: 0,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5,
                                    textTransform: 'none',
                                    '& .MuiSvgIcon-root': { fontSize: 36 },
                                }}
                            >
                                {selectedEstimateOption.icon}
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                    {selectedEstimateOption.label}
                                </span>
                            </Button>
                            <Menu
                                anchorEl={estimateAnchorEl}
                                open={!!estimateAnchorEl}
                                onClose={() => setEstimateAnchorEl(null)}
                            >
                                {estimateOptions.map((option) => (
                                    <MenuItem
                                        key={`estimate-${option.value || 'unset'}`}
                                        onClick={() => {
                                            onValueChangeHandler('estimate_time', option.value)
                                            setEstimateAnchorEl(null)
                                        }}
                                    >
                                        <ListItemIcon>{option.icon}</ListItemIcon>
                                        <ListItemText>{option.label}</ListItemText>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </FormControl>

                        <FormControl sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel component='legend'>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                    <LocalOfferIcon sx={{ fontSize: 14 }} />
                                    <span>pricing</span>
                                </Box>
                            </FormLabel>
                            <Button
                                variant='outlined'
                                onClick={(event) => setPricingAnchorEl(event.currentTarget)}
                                sx={{
                                    width: '100%',
                                    height: 92,
                                    minWidth: 0,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5,
                                    textTransform: 'none',
                                    '& .MuiSvgIcon-root': { fontSize: 36 },
                                }}
                            >
                                {selectedPricingOption.icon}
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                    {selectedPricingOption.label}
                                </span>
                            </Button>
                            <Menu
                                anchorEl={pricingAnchorEl}
                                open={!!pricingAnchorEl}
                                onClose={() => setPricingAnchorEl(null)}
                            >
                                {pricingOptions.map((option) => (
                                    <MenuItem
                                        key={`price-${option.value || 'unset'}`}
                                        onClick={() => {
                                            onValueChangeHandler('price', option.value)
                                            setPricingAnchorEl(null)
                                        }}
                                    >
                                        <ListItemIcon>{option.icon}</ListItemIcon>
                                        <ListItemText>{option.label}</ListItemText>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </FormControl>
                    </Box>
                    </>
                    )}
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
                    {!isDesktopWeb ? (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <FormControl sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel component='legend'>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                    <HomeIcon sx={{ fontSize: 14 }} />
                                    <span>permanent</span>
                                </Box>
                            </FormLabel>
                            <Button
                                variant='outlined'
                                onClick={(event) => setPermanentAnchorEl(event.currentTarget)}
                                sx={{
                                    width: '100%',
                                    height: 92,
                                    minWidth: 0,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5,
                                    textTransform: 'none',
                                    '& .MuiSvgIcon-root': { fontSize: 36 },
                                }}
                            >
                                {selectedPermanentOption.icon}
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                    {selectedPermanentOption.label}
                                </span>
                            </Button>
                            <Menu
                                anchorEl={permanentAnchorEl}
                                open={!!permanentAnchorEl}
                                onClose={() => setPermanentAnchorEl(null)}
                            >
                                {yesNoOptions.map((option) => (
                                    <MenuItem
                                        key={`permanent-${String(option.value) || 'unset'}`}
                                        onClick={() => {
                                            onValueChangeHandler('permanent', option.value)
                                            setPermanentAnchorEl(null)
                                        }}
                                    >
                                        <ListItemIcon>{option.icon}</ListItemIcon>
                                        <ListItemText>{option.label}</ListItemText>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </FormControl>

                        <FormControl sx={{ flex: 1, minWidth: 0 }}>
                            <FormLabel component='legend'>
                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                    <EventAvailableIcon sx={{ fontSize: 14 }} />
                                    <span>need booking</span>
                                </Box>
                            </FormLabel>
                            <Button
                                variant='outlined'
                                onClick={(event) => setBookingAnchorEl(event.currentTarget)}
                                sx={{
                                    width: '100%',
                                    height: 92,
                                    minWidth: 0,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5,
                                    textTransform: 'none',
                                    '& .MuiSvgIcon-root': { fontSize: 36 },
                                }}
                            >
                                {selectedBookingOption.icon}
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                    {selectedBookingOption.label}
                                </span>
                            </Button>
                            <Menu
                                anchorEl={bookingAnchorEl}
                                open={!!bookingAnchorEl}
                                onClose={() => setBookingAnchorEl(null)}
                            >
                                {yesNoOptions.map((option) => (
                                    <MenuItem
                                        key={`booking-${String(option.value) || 'unset'}`}
                                        onClick={() => {
                                            onValueChangeHandler('need_booking', option.value)
                                            setBookingAnchorEl(null)
                                        }}
                                    >
                                        <ListItemIcon>{option.icon}</ListItemIcon>
                                        <ListItemText>{option.label}</ListItemText>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </FormControl>
                    </Box>
                    ) : null}
                    <Stack spacing={0}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            label='social media link'
                            value={formValue.social_media_link}
                            onChange={(e) => onValueChangeHandler('social_media_link', e.target.value)}
                            error={!!error.social_media_link}
                            helperText={error.social_media_link}
                        />
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
                    <TextField
                        variant='outlined'
                        fullWidth
                        label='social media original link'
                        value={formValue.social_media_link}
                        onChange={(e) => onValueChangeHandler('social_media_link', e.target.value)}
                        helperText='Optional. Keep this separate from website.'
                    />
                    <TextField
                        variant='outlined'
                        fullWidth
                        label='description'
                        multiline
                        minRows={3}
                        value={formValue.description}
                        onChange={(e) => onValueChangeHandler('description', e.target.value)}
                        error={!!error.description}
                        helperText={error.description}
                    />
                </Stack>
            </BaseForm>
            <ImageLinkValidate 
                shouldOpen={imageFormState === 'weblink'}
                handleClose={() => setImageState('')}
                imageLink={(formValue.imageLink && formValue.imageLink.type === 'weblink') ? formValue.imageLink.value : ''}
                setImageLink={onImageLinkChangeHandler}
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
