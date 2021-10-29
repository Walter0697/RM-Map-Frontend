import React, { useState, useEffect } from 'react'
import {
    Grid,
    Button,
} from '@mui/material'

import { useQuery, useMutation } from '@apollo/client'

import useBoop from '../../hooks/useBoop'

import AddCircleIcon from '@mui/icons-material/AddCircle'

import AdminTopBar from '../../components/topbar/AdminTopBar'
import MarkerTypeForm from '../../components/form/admin/MarkerTypeForm'

import graphql from '../../graphql'

function TypeManage() {
    const { data: typeData, loading: typeLoading, error: typeError } = useQuery(graphql.markertypes.list, { fetchPolicy: 'no-cache' })

    const [ createFormOpen, setFormOpen ] = useState(false)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createMessage, setMessage ] = useState('')

    useEffect(() => {
        if (typeData) {
            console.log(typeData)
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
                <Grid item xs={12} md={12} lg={12}>
                    <Button 
                        variant="outlined" 
                        startIcon={<AddCircleIcon />}
                        onClick={() => setFormOpen(true)}    
                    >
                        Add New
                    </Button>
                </Grid>
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