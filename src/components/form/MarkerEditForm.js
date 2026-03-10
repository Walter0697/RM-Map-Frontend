import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
import image from '../../scripts/image'
import actions from '../../store/actions'
import graphql from '../../graphql'
import backend from '../../constant/backend'

import dayjs from 'dayjs'
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

function MarkerEditForm({
    open, 
    handleClose,
    onUpdated,
    marker,
    eventtypes,
    dispatch,
}) {
    const theme = useTheme()
    const isDesktopWeb = useMediaQuery(theme.breakpoints.up('lg'))
    const [ editMarkerGQL, { data: editData, loading: editLoading, error: editError } ] = useMutation(graphql.markers.edit, { errorPolicy: 'all' })
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
        need_booking: '',
        permanent:  '',
        from_time: null,
        to_time: null,    
    })
    const [ websiteLink, setWebsiteLink ] = useState('')
    const [ error, setError ] = useObject({})

    const [ imageFormState , setImageState ] = useState('') // weblink, preview
    const [ imageSubmitMessage, setImageMessage ] = useState('')

    const [ shouldRemoveRestaurantData, setShouldRemoveRestaurantData ] = useState(false)

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

    useEffect(() => {
        if (!marker) return

        // if marker updated, reset everything inside the form
        
        setSubmitting(false)
        setImageMessage('')
        setUnauthorized(false)
        resetFormValue()

        setFormValue('label', marker.label)
        setFormValue('address', marker.address)
        setFormValue('link', marker.link)
        setFormValue('type', marker.type)
        setFormValue('description', marker.description)
        setFormValue('estimate_time', marker.estimate_time)
        setFormValue('price', marker.price)
        setFormValue('need_booking', marker.need_booking)
        setFormValue('permanent', marker.permanent)
        setFormValue('from_time', marker.from_time ? new Date(dayjs.utc(marker.from_time).format('MM/DD/YYYY HH:mm')) : null)
        setFormValue('to_time', marker.to_time ? new Date(dayjs.utc(marker.to_time).format('MM/DD/YYYY HH:mm')) : null)
        setWebsiteLink('')

        if (marker.image_link) {
            setFormValue('imageLink', {
                type: 'existing', 
                value: marker.image_link,
            })
            setImageMessage('current image')
        }    

        if (marker.restaurant) {
            setScrapperData({ restaurant: marker.restaurant })
        }
    }, [marker])

    useEffect(() => {
        if (editError) {
            setAlertMessage({
                type: 'error',
                message: editError.message,
            })
            setSubmitting(false)
        }

        if (editData) {
            dispatch(actions.editMarker(editData.editMarker))
            onUpdated && onUpdated()
        }
    }, [editData, editError])

    useEffect(() => {
        if (scrapImageLoading) return
        if (scrapImageData) {
            if (scrapImageData.scrapimage.image_link) {
                if (!formValue.imageLink) {
                    setFormValue('imageLink', {
                        type: 'weblink',
                        value: scrapImageData.scrapimage.image_link,
                    })
                    setImageState('scrap')
                    setImageMessage('image by scrapping website')
                }
            }

            if (scrapImageData.scrapimage.title) {
                if (!formValue.label) {
                    setFormValue('label', scrapImageData.scrapimage.title)
                }
            }
        }
    }, [scrapImageData, scrapImageLoading])

    const scrapImageWithLink = useCallback(() => {
        if (!open) return
        if (!websiteLink) return
        if (!formValue.imageLink) {
            setImageMessage('the internet...')
        }
        scrapimageGQL({ variables: { link: websiteLink }})
    }, [ open, websiteLink, formValue.imageLink ])

    //bounce(scrapImageWithLink, 2000, [ websiteLink, formValue.imageLink, open ])

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

    const removeRestaurantData = () => {
        setScrapperData(null)
        setShouldRemoveRestaurantData(true)
    }

    const restoreRestaurantData = () => {
        setShouldRemoveRestaurantData(false)
        if (marker.restaurant) {
            setScrapperData({ restaurant: marker.restaurant })
        }
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

        editMarkerGQL({ variables: {
            id: marker.id,
            label: formValue.label,
            type: formValue.type,
            address: formValue.address,
            link: formValue.link,
            image_link: (formValue.imageLink && formValue.imageLink.type === 'weblink') ? formValue.imageLink.value : null,
            image_upload: (formValue.imageLink && formValue.imageLink.type === 'upload') ? formValue.imageLink.value : null,
            no_image: formValue.imageLink ? false : true,   // since we will preset existing now, null value should be deleting the image
            description: formValue.description,
            estimate_time: formValue.estimate_time,
            price: formValue.price,
            permanent: formValue.permanent === '' ? false : formValue.permanent,
            need_booking: formValue.need_booking === '' ? false : formValue.need_booking,
            to_time: to,
            from_time: from,
            restaurant_id: restaurant_id,
            remove_restaurant: shouldRemoveRestaurantData,
        }})
    }

    const restaurantInfoMessage = useMemo(() => {
        if (scrapperData?.restaurant) {
            return (
                <div
                    style={{
                        color: 'red'
                    }}
                    onClick={removeRestaurantData}
                >
                    <DeleteIcon sx={{ verticalAlign: 'middle', display: 'inline-block', fontSize: '18px' }}/> 
                    <span style={{ verticalAlign: 'middle', display: 'inline-block' }}>Remove {scrapperData?.restaurant.name} Data</span>
                </div>
            )
        }
        if (marker?.restaurant) {
            return (
                <div
                    style={{
                        color: 'blue'
                    }}
                    onClick={restoreRestaurantData}
                >
                    <DeleteIcon sx={{ verticalAlign: 'middle', display: 'inline-block', fontSize: '18px' }}/> 
                    <span style={{ verticalAlign: 'middle', display: 'inline-block' }}>Restore {marker?.restaurant.name} Data</span>
                </div>
            )
        }
    }, [scrapperData, marker, setShouldRemoveRestaurantData])

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
            {marker ? `${format5Sig(marker.latitude)}, ${format5Sig(marker.longitude)}` : ''}
        </Box>
    )

    return (
        <>
            <BaseForm
                open={open}
                handleClose={handleClose}
                title={`Editing ${marker?.label}`}
                maxWidth={'lg'}
                handleSubmit={onSubmitHandler}
                cancelText={'Cancel'}
                createText={'Update'}
                loading={submitting}
                isSubmitUnauthorized={isUnauthorized}
                alertMessage={alertMessage}
                clearAlertMessage={() => setAlertMessage(null)}
                footerStart={footerLatLon}
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
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{selectedEstimateOption.label}</span>
                                </Button>
                                <Menu anchorEl={estimateAnchorEl} open={!!estimateAnchorEl} onClose={() => setEstimateAnchorEl(null)}>
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
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{selectedPricingOption.label}</span>
                                </Button>
                                <Menu anchorEl={pricingAnchorEl} open={!!pricingAnchorEl} onClose={() => setPricingAnchorEl(null)}>
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
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{selectedPermanentOption.label}</span>
                                </Button>
                                <Menu anchorEl={permanentAnchorEl} open={!!permanentAnchorEl} onClose={() => setPermanentAnchorEl(null)}>
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
                                    <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{selectedBookingOption.label}</span>
                                </Button>
                                <Menu anchorEl={bookingAnchorEl} open={!!bookingAnchorEl} onClose={() => setBookingAnchorEl(null)}>
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
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{selectedEstimateOption.label}</span>
                            </Button>
                            <Menu anchorEl={estimateAnchorEl} open={!!estimateAnchorEl} onClose={() => setEstimateAnchorEl(null)}>
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
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{selectedPricingOption.label}</span>
                            </Button>
                            <Menu anchorEl={pricingAnchorEl} open={!!pricingAnchorEl} onClose={() => setPricingAnchorEl(null)}>
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
                        label={'to'}
                        noPast
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
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{selectedPermanentOption.label}</span>
                            </Button>
                            <Menu anchorEl={permanentAnchorEl} open={!!permanentAnchorEl} onClose={() => setPermanentAnchorEl(null)}>
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
                                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{selectedBookingOption.label}</span>
                            </Button>
                            <Menu anchorEl={bookingAnchorEl} open={!!bookingAnchorEl} onClose={() => setBookingAnchorEl(null)}>
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
                        {restaurantInfoMessage && <Box>{restaurantInfoMessage}</Box>}
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
                source={scrapperOpen}
                value={scrapperData}
                setValue={onScrapperFinish}
            />
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(MarkerEditForm)
