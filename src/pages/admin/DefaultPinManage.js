import React, { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    Grid,
    IconButton,
    Stack,
    Typography,
} from '@mui/material'
import backend from '../../constant/backend'

import { useQuery, useLazyQuery } from '@apollo/client'

import useBoop from '../../hooks/useBoop'

import EditIcon from '@mui/icons-material/Edit'

import AdminPageShell from '../../components/admin/AdminPageShell'
import DefaultPinForm from '../../components/form/admin/DefaultPinForm'

import graphql from '../../graphql'

function DefaultPinManage() {
    // graphql request
    const { data: pinData, loading: pinLoading, error: pinError } = useQuery(graphql.pins.select, { fetchPolicy: 'no-cache' })
    const [ listDefaultPinsGQL, { data: defaultData, loading: defaultLoading, error: defaultError } ] = useLazyQuery(graphql.defaults.pins, { fetchPolicy: 'no-cache' })

    // pin information for selection
    const [ pinList, setPinList ] = useState([])

    const [ defaultList, setList ] = useState([])

    const [ editFormOpen, setFormOpen ] = useState(false)
    const [ selectedDefault, setSelected ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createMessage, setMessage ] = useState('')
    
    useEffect(() => {
        listDefaultPinsGQL()
    }, [])

    useEffect(() => {
        if (defaultData) {
            setList(defaultData.defaultpins)
        }

        if (defaultError) {
            console.log(defaultError)
        }
    }, [defaultData, defaultError])

    useEffect(() => {
        if (pinData) {
            setPinList(pinData.pins)
        }

        if (pinError) {
            console.log(pinError)
        }
    }, [pinData, pinError])

    const onUpdateFormOpen = (item) => {
        setSelected(item)
        setFormOpen(true)
    }

    const onDefaultUpdated = () => {
        setMessage('successfully updated default pin')
        setFormOpen(false)
        confirmCreated()
        listDefaultPinsGQL()
    }

    return (
        <AdminPageShell
            title='Default Pin Manage'
            description='Set fallback pin assignments used by each default slot.'
            alertOpen={createAlert}
            alertMessage={createMessage}
        >
            <Stack spacing={1.5}>
                {defaultList.map((item, index) => (
                    <Card
                        key={index}
                        className='admin-panel'
                        sx={{ backgroundColor: '#eef8ff' }}
                    >
                        <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '120px minmax(0, 1fr) 90px' },
                                    gap: 1,
                                    alignItems: 'center',
                                }}
                            >
                                <Box sx={{ minHeight: 72, display: 'flex', alignItems: 'center' }}>
                                    {item.pin?.display_path ? (
                                        <img
                                            src={backend.IMAGE_LINK + item.pin.display_path}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: 70,
                                                width: 'auto',
                                                height: 'auto',
                                                display: 'block',
                                            }}
                                        />
                                    ) : null}
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                                        {item.label}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                        {item.pin?.label ? item.pin.label : '<USING DEFAULT>'}
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
                                    </Stack>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
            <DefaultPinForm
                open={editFormOpen}
                handleClose={() => setFormOpen(false)}
                onUpdated={onDefaultUpdated}
                pinList={pinList}
                defaultPin={selectedDefault}
            />
        </AdminPageShell>
    )
}

export default DefaultPinManage
