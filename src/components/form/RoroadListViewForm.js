import React, { useMemo, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Button,
    IconButton,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Slide,
} from '@mui/material'

import constants from '../../constant'
import actions from '../../store/actions'
import graphql from '../../graphql'

const TransitionUp = (props) => {
    return <Slide {...props} direction='up' />
}

function RoroadListViewForm({
    open,
    handleClose,
    roroadlist,
    onUpdated,
    onFailHandler,
    dispatch,
}) {
    const [ updateRoroadListGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.roroadlists.edit, { errorPolicy: 'all' })

    const listTypeLabel = useMemo(() => {
        if (!roroadlist) return ''
        const typeObj = constants.listtype.list.find(s => s.value === roroadlist.list_type)
        if (typeObj) {
            return typeObj.label
        }
        return ''
    }, [roroadlist]) 

    useEffect(() => {
        if (updateData) {
            const updated = JSON.parse(JSON.stringify(roroadlist))
            updated.hidden = false
            dispatch(actions.addRoroadList(updated))
            onUpdated && onUpdated()
        }
    }, [updateData])

    useEffect(() => {
        if (updateError) {
            onFailHandler && onFailHandler()
        }
    }, [updateError])

    const onRevokeHandler = () => {
        const confirmed = window.confirm('Do you want to revoke this roroadlist?')
        if (confirmed) {
            updateRoroadListGQL({ variables: {
                id: roroadlist.id,
                hidden: false,
            }})
        }
    }

    return (
        <>
            <Dialog
                fullWidth
                maxWidth={'lg'}
                open={open}
                onClose={handleClose}
                scroll={'paper'}
                TransitionComponent={TransitionUp}
            >
                {roroadlist && (
                    <>
                        <DialogTitle>
                            <Grid container spacing={1}>
                                <Grid item xs={12} md={12} lg={12}>
                                    Previous RoroadList View
                                </Grid>
                            </Grid>
                        </DialogTitle>
                        <DialogContent dividers>
                            <DialogContentText>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={12} lg={12}>
                                        Name: {roroadlist.name}
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={12}>
                                        Type: {listTypeLabel}
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={12}>
                                        Target User: {roroadlist.target_user}
                                    </Grid>
                                    <Grid item xs={12} md={12} lg={12}>
                                        <Button 
                                            variant='contained'
                                            size='middle'
                                            color='primary'
                                            style={{
                                                color: 'white',
                                                marginLeft: '10%',
                                                width: '80%',
                                                boxShadow: '2px 2px 6px'
                                            }}
                                            onClick={onRevokeHandler}
                                        >Revoke</Button>
                                    </Grid>
                                </Grid>
                            </DialogContentText>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
}))(RoroadListViewForm)