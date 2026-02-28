import React, { useState, useEffect } from 'react'
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
import backend from '../../constant/backend'

import { useQuery, useLazyQuery, useMutation } from '@apollo/client'

import useBoop from '../../hooks/useBoop'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import AdminPageShell from '../../components/admin/AdminPageShell'
import PinForm from '../../components/form/admin/PinForm'

import graphql from '../../graphql'

function PinManage() {
    // graphql request
    const { data: typeData, loading: typeLoading, error: typeError } = useQuery(graphql.markertypes.preview_list, { fetchPolicy: 'no-cache' })
    const [ listPinGQL, { data: pinData, loading: pinLoading, error: pinError } ] = useLazyQuery(graphql.pins.list, { fetchPolicy: 'no-cache' })
    const [ removePinGQL, { data: removeData, loading: removeLoading, error: removeError } ] = useMutation(graphql.pins.remove, { errorPolicy: 'all' })

    // marker type information for selection
    const [ typeList, setTypeList ] = useState([])

    const [ pinList, setList ] = useState([])

    const [ createFormOpen, setFormOpen ] = useState(false)
    const [ selectedPin, setSelected ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createMessage, setMessage ] = useState('')

    useEffect(() => {
        listPinGQL()
    }, [])

    useEffect(() => {
        if (pinData) {
            setList(pinData.pins)
        }

        if (pinError) {
            console.log(pinError)
        }
    }, [pinData, pinError])

    useEffect(() => {
        if (removeData) {
            listPinGQL()
        }

        if (removeError) {
            console.log(removeError)
            listPinGQL()
        }
    }, [removeData, removeError])

    useEffect(() => {
        if (typeData) {
            setTypeList(typeData.markertypes)
        }

        if (typeError) {
            console.log(typeError)
        }
    }, [typeData, typeError])

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
                <Button
                    className='admin-action-button'
                    variant='contained'
                    startIcon={<AddCircleIcon />}
                    onClick={onCreateFormOpen}
                >
                    Add New
                </Button>
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
                                    <Typography variant='body2' color='text.secondary'>
                                        topleft: {item.top_left_x}, {item.top_left_y}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                        bottomright: {item.bottom_right_x}, {item.bottom_right_y}
                                    </Typography>
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
            />
        </AdminPageShell>
    )
}

export default PinManage
