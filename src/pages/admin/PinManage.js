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
import PinForm from '../../components/form/admin/PinForm'

import graphql from '../../graphql'

function PinManage() {
    // graphql request
    const { data: typeData, loading: typeLoading, error: typeError } = useQuery(graphql.markertypes.preview_list, { fetchPolicy: 'no-cache' })

    // marker type information for selection
    const [ typeList, setTypeList ] = useState([])

    const [ pinList, setList ] = useState([])

    const [ createFormOpen, setFormOpen ] = useState(false)
    const [ selectedPin, setSelected ] = useState(null)
    const [ createAlert, confirmCreated ] = useBoop(3000)
    const [ createMessage, setMessage ] = useState('')

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

    const onTypeCreated = () => {
        setMessage('successfully created pin')
        setFormOpen(false)
        confirmCreated()
        //listMarkerTypeGQL()
    }

    const onTypeUpdated = () => {
        setMessage('successfully updated pin')
        setFormOpen(false)
        confirmCreated()
        //listMarkerTypeGQL()
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