import React, { useState, useEffect, useMemo } from 'react'
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

import { useLazyQuery, useMutation } from '@apollo/client'

import useBoop from '../../hooks/useBoop'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import AdminPageShell from '../../components/admin/AdminPageShell'
import MarkerTypeForm from '../../components/form/admin/MarkerTypeForm'

import graphql from '../../graphql'

function TypeManage() {
    const [ listMarkerTypeGQL, { data: typeData, loading: typeLoading, error: typeError } ]= useLazyQuery(graphql.markertypes.list, { fetchPolicy: 'no-cache' })
    const [ removeMarkerTypeGQL, { data: removeData, loading: removeLoading, error: removeError } ] = useMutation(graphql.markertypes.remove, { errorPolicy: 'all' })

    const [ typeList, setList ] = useState([])

    const [ createFormOpen, setFormOpen ] = useState(false)
    const [ selectedMarker, setSelected ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createMessage, setMessage ] = useState('')

    const typeOrderedList = useMemo(() => {
        const sortedList = typeList
        sortedList.sort((a, b) => a.priority - b.priority)
        return sortedList
    }, [typeList])

    useEffect(() => {
        listMarkerTypeGQL()
    }, [])

    useEffect(() => {
        if (typeData) {
            setList(typeData.markertypes)
        }
    }, [typeData, typeError])
    
    useEffect(() => {
        if (removeData) {
            listMarkerTypeGQL()
        }

        if (removeError) {
            listMarkerTypeGQL()
        }
    }, [removeData, removeError])

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
        removeMarkerTypeGQL({ variables: { id: item.id }})
    }

    const onTypeCreated = () => {
        setMessage('successfully created type')
        setFormOpen(false)
        confirmCreated()
        listMarkerTypeGQL()
    }

    const onTypeUpdated = () => {
        setMessage('successfully updated type')
        setFormOpen(false)
        confirmCreated()
        listMarkerTypeGQL()
    }

    return (
        <AdminPageShell
            title='Type Manage'
            description='Manage marker type labels, icons, visibility, and sort priority.'
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
                {typeOrderedList.map((item, index) => (
                    <Card
                        key={index}
                        className='admin-panel'
                        sx={{
                            backgroundColor: item.hidden ? '#fde8f5' : '#eef8ff',
                        }}
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
                                        src={backend.IMAGE_LINK + item.icon_path}
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
                                    <Typography
                                        variant='subtitle1'
                                        sx={{ fontWeight: 700 }}
                                    >
                                        {item.label}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                        with value: {item.value}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                        priority: {item.priority}
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
            <MarkerTypeForm
                open={createFormOpen}
                handleClose={() => setFormOpen(false)}
                onCreated={onTypeCreated}
                onUpdated={onTypeUpdated}
                markerType={selectedMarker}
            />
        </AdminPageShell>
    )
}

export default TypeManage
