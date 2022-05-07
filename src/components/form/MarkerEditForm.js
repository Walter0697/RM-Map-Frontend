import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
    Grid,
    TextField,
    Button,
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

import useObject from '../../hooks/useObject'
import useDebounce from '../../hooks/useDebounce'

import BaseForm from './BaseForm'
import ScrapperForm from './ScrapperForm'
import ImageLinkValidate from './image/ImageLinkValidate'
import ImagePreview from './image/ImagePreview'
import Selectable from '../field/Selectable'
import NullableDatePicker from '../field/NullableDatePicker'

import generic from '../../scripts/generic'
import actions from '../../store/actions'
import graphql from '../../graphql'

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
        need_booking: false,
        permanent:  false,
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
        setFormValue('from_time', marker.from_time ? dayjs.utc(marker.from_time).format('MM/DD/YYYY HH:mm') : null)
        setFormValue('to_time', marker.to_time ? dayjs.utc(marker.to_time).format('MM/DD/YYYY HH:mm') : null)
        
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
    }, [scrapImageData])

    const scrapImageWithLink = () => {
        if (!open) return
        if (websiteLink === '') return
        if (!formValue.imageLink) {
            setImageMessage('scrapping image from website...')
        }
        scrapimageGQL({ variables: { link: websiteLink }})
    }

    useDebounce(scrapImageWithLink, 2000, [ websiteLink, formValue.imageLink, open ])

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

    // handle image upload
    const handleImageChange = (e) => {
        if (e.target.files.length) {
            setFormValue('imageLink', {
                type: 'upload',
                value: e.target.files[0],
                name: e.target.files[0].name,
            })
            setImageMessage('image from user upload')
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
            permanent: formValue.permanent,
            need_booking: formValue.need_booking,
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
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
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
                    </Grid>
                    <Grid item xs={6} md={6} lg={6}>
                        <TextField
                            InputLabelProps={{
                                shrink: true,
                            }}
                            variant='outlined'
                            size='small'
                            fullWidth
                            label='longitude'
                            value={marker?.longitude}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={6} md={6} lg={6}>
                        <TextField
                            InputLabelProps={{
                                shrink: true,
                            }}
                            variant='outlined'
                            size='small'
                            fullWidth
                            label='latitude'
                            value={marker?.latitude}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
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
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            InputLabelProps={{
                                shrink: !!formValue.address,
                            }}
                            variant='outlined'
                            fullWidth
                            required
                            label='address'
                            value={formValue.address}
                            onChange={(e) => onValueChangeHandler('address', e.target.value)}
                            error={!!error.address}
                            helperText={error.address}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                    <Grid container spacing={0}>
                            <Grid item xs={9} md={9} lg={9}>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    label='website'
                                    value={formValue.link}
                                    onChange={(e) => onValueChangeHandler('link', e.target.value)}
                                    error={!!error.link}
                                    helperText={error.link}
                                />
                            </Grid>
                            <Grid item xs={3} md={3} lg={3}>
                                    <Button 
                                        variant='outlined'
                                        id='website-menu-button'
                                        aria-controls={menuOpen ? 'website-menu' : undefined}
                                        aria-haspopup='true'
                                        aria-expanded={menuOpen ? 'true' : undefined}
                                        onClick={handleMenuClick}
                                        fullWidth
                                        style={{
                                            height: '100%',
                                        }}
                                    >
                                        <MoreVertIcon />
                                    </Button>
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
                                                <RiceBowlIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Openrice</ListItemText>
                                        </MenuItem>
                                    </Menu>
                            </Grid>
                            {restaurantInfoMessage}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <FormControl component='image' fullWidth>
                            <FormLabel 
                                component='legend'
                            >
                                Preview
                            </FormLabel>
                            <FormLabel>
                                {imageSubmitMessage}
                            </FormLabel>
                            <Grid container spacing={0} fullWidth>
                                <Grid item xs={4} md={4} lg={4}>
                                    <Button 
                                        variant='outlined'
                                        fullWidth
                                        onClick={() => setImageState('weblink')}>
                                        <AddLinkIcon />
                                    </Button>
                                </Grid>
                                <Grid item xs={4} md={4} lg={4}>
                                    <input type='file' id='upload-image' style={{ display: 'none' }} onChange={handleImageChange} />
                                    <label htmlFor='upload-image'>
                                        <Button 
                                            variant='outlined'
                                            component='span'
                                            fullWidth>
                                            <InsertDriveFileIcon />
                                        </Button>
                                    </label>
                                </Grid>
                                <Grid item xs={4} md={4} lg={4}>
                                    <Button 
                                        variant='outlined'
                                        fullWidth
                                        disabled={!formValue.imageLink}
                                        onClick={() => setImageState('preview')}
                                    >
                                        <VisibilityIcon />
                                    </Button>
                                </Grid>
                            </Grid>
                            <FormLabel>
                                {formValue.imageLink && (
                                    <div 
                                        style={{
                                            color: 'red',
                                        }}
                                        onClick={removeImage}
                                    >
                                        <DeleteIcon sx={{ verticalAlign: 'middle', display: 'inline-block', fontSize: '18px' }}/> 
                                        <span style={{ verticalAlign: 'middle', display: 'inline-block' }}>Remove Image</span>
                                    </div>)}
                            </FormLabel>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <TextField
                            variant='outlined'
                            fullWidth
                            label='description'
                            value={formValue.description}
                            onChange={(e) => onValueChangeHandler('description', e.target.value)}
                            error={!!error.description}
                            helperText={error.description}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
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
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
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
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <NullableDatePicker
                            label={'from'}
                            value={formValue.from_time}
                            onValueChange={(e) => onValueChangeHandler('from_time', e)}
                            errorMessage={error.from_time}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <NullableDatePicker
                            label={'to'}
                            noPast
                            value={formValue.to_time}
                            onValueChange={(e) => onValueChangeHandler('to_time', e)}
                            errorMessage={error.to_time}
                        />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
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
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
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
                    </Grid>
                </Grid>
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