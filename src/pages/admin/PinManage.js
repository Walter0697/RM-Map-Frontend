import React, { useState, useEffect } from 'react'
import {
    Grid,
    Button,
    IconButton,
} from '@mui/material'

import { useQuery, useLazyQuery, useMutation } from '@apollo/client'

import useBoop from '../../hooks/useBoop'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import AdminTopBar from '../../components/topbar/AdminTopBar'
import PinForm from '../../components/form/admin/PinForm'

import graphql from '../../graphql'
import constants from '../../constant'

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
        <>
            <AdminTopBar
                label={'Pin Manage'}
                alertOpen={createAlert}
                alertMessage={createMessage}
            />
            <Grid 
                container
                spacing={2}
                style={{
                    marginTop: '10px',
                    marginLeft: '1%',
                    width: '98%',
                }}
            >
                <Grid
                    item xs={12} md={12} lg={12}
                    style={{
                        marginBottom: '15%',
                    }}    
                >
                    <Button 
                        variant="outlined" 
                        startIcon={<AddCircleIcon />}
                        onClick={onCreateFormOpen}    
                    >
                        Add New
                    </Button>
                </Grid>
                { pinList.map(( item, index ) => (
                    <Grid
                        item xs={12} md={12} lg={12}
                        style={{
                            backgroundColor: '#dbfdff',
                            marginBottom: '10px',
                            marginLeft: '10px',
                            marginRight: '10px',
                            borderRadius: '5px',
                            height: '100px',
                        }}
                        key={index}   
                    >
                         <Grid container fullWidth>
                            <Grid 
                                item xs={4} md={4} lg={4}
                            >
                                <img
                                    height='70px'
                                    src={constants.BackendImageLink + item.image_path}
                                />
                            </Grid>
                            <Grid item xs={6} md={6} lg={6}>
                                <Grid container fullWidth>
                                    <Grid item xs={12}
                                        style={{
                                            fontweight: '600',
                                            fontSize: '20px',
                                            marginBottom: '5px',
                                        }}
                                    >
                                        {item.label}
                                    </Grid>
                                    <Grid item xs={12}
                                        style={{
                                            fontSize: '12px',
                                            color: 'grey',
                                        }}
                                    >
                                        topleft: {item.top_left_x}, {item.top_left_y}
                                    </Grid>
                                    <Grid item xs={12}
                                        style={{
                                            fontSize: '12px',
                                            color: 'grey',
                                        }}
                                    >
                                        bottomright: {item.bottom_right_x}, {item.bottom_right_y}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} md={2} lg={2}>
                                <IconButton
                                    onClick={() => onUpdateFormOpen(item)}
                                >
                                    <EditIcon /> 
                                </IconButton>
                                <IconButton
                                    onClick={() => onRemoveButtonClick(item)}
                                >
                                    <DeleteIcon sx={{ color: 'red' }}/> 
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
            <PinForm
                open={createFormOpen}
                handleClose={() => setFormOpen(false)}
                onCreated={onTypeCreated}
                onUpdated={onTypeUpdated}
                typeList={typeList}
                pin={selectedPin}
            />
        </>
    )
}

export default PinManage