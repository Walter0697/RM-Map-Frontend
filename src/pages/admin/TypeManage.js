import React, { useState, useEffect, useMemo } from 'react'
import {
    Grid,
    Button,
    IconButton,
} from '@mui/material'

import { useQuery, useMutation } from '@apollo/client'

import useBoop from '../../hooks/useBoop'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import AdminTopBar from '../../components/topbar/AdminTopBar'
import MarkerTypeForm from '../../components/form/admin/MarkerTypeForm'
import BottomUpTrail from '../../components/animatein/BottomUpTrail'

import graphql from '../../graphql'

function TypeManage() {
    const { data: typeData, loading: typeLoading, error: typeError } = useQuery(graphql.markertypes.list, { fetchPolicy: 'no-cache' })

    const [ typeList, setList ] = useState([])

    const [ createFormOpen, setFormOpen ] = useState(false)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createMessage, setMessage ] = useState('')

    const typeOrderedList = useMemo(() => {
        const sortedList = typeList
        sortedList.sort((a, b) => a.priority - b.priority)
        return sortedList
    }, [typeList])

    useEffect(() => {
        if (typeData) {
            setList(typeData.markertypes)
        }

        if (typeError) {
            console.log(typeError)
        }
    }, [typeData, typeError])

    const onTypeCreated = () => {
        setMessage('successfully created type')
        setFormOpen(false)
        confirmCreated()
    }

    return (
        <>
            <AdminTopBar 
                label={'Type Manage'} 
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
                        marginBottom: '15px',
                    }}    
                >
                    <Button 
                        variant="outlined" 
                        startIcon={<AddCircleIcon />}
                        onClick={() => setFormOpen(true)}    
                    >
                        Add New
                    </Button>
                </Grid>
                { typeOrderedList.map(( item, index) => (
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
                                style={{
                                }}
                            >
                                <img
                                    height='70px'
                                    src={process.env.REACT_APP_IMAGE_LINK + item.icon_path}
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
                                        with value: {item.value}
                                    </Grid>
                                    <Grid item xs={12}
                                        style={{
                                            fontSize: '12px',
                                            color: 'grey',
                                        }}
                                    >
                                        priority: {item.priority}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={2} md={2} lg={2}>
                                <IconButton
                                    onClick={() => {}}
                                >
                                    <EditIcon /> 
                                </IconButton>
                                <IconButton
                                    onClick={() => {}}
                                >
                                    <DeleteIcon sx={{ color: 'red' }}/> 
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                ))}
            </Grid>
            <MarkerTypeForm
                open={createFormOpen}
                handleClose={() => setFormOpen(false)}
                onCreated={onTypeCreated}
            />
        </>
    )
}

export default TypeManage