import React, { useMemo, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { useMutation } from '@apollo/client'
import {
    Grid,
    Button,
} from '@mui/material'

import EditLocationIcon from '@mui/icons-material/EditLocation'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'

import actions from '../../../store/actions'
import graphql from '../../../graphql'

function RoroadListItem({
    item,
    onClickHandler,
    onUpdateFailHandler,
    selectedItems,
    dispatch,
}) {
    const [ updateRoroadListGQL, { data: updateData, loading: updateLoading, error: updateError } ] = useMutation(graphql.roroadlists.edit, { errorPolicy: 'all' })

    const typeIcon = useMemo(() => {
        switch (item.list_type) {
            case 'togo':
                return <EditLocationIcon />
            case 'todo':
                return <ModeEditIcon />
            case 'important':
                return <PriorityHighIcon />
            case 'partner':
                return <VolunteerActivismIcon />
            case 'others':
                return <QuestionMarkIcon />
        }
        return <QuestionMarkIcon/>
    }, [item])

    const backgroundColor = useMemo(() => {
        switch (item.list_type) {
            case 'togo':
                return '#48acdb'
            case 'todo':
                return '#006e1a'
            case 'important':
                return '#f91231'
            case 'partner':
                return '#ff49d5'
            case 'others':
                return '#646565'
        }
        return '#48acdb'
    }, [item])

    const isSelected = useMemo(() => {
        if (selectedItems && item) {
            if (selectedItems.includes(item.id)) {
                return true
            }
        }
        return false
    }, [item, selectedItems])

    useEffect(() => {
        if (updateError) {
            onUpdateFailHandler && onUpdateFailHandler()
        }

        // if the request go successfully, the item should be already updated in frontend
    }, [updateError])

    const onCheckedClickHandler = () => {
        const updatingItem = JSON.parse(JSON.stringify(item))
        updatingItem.checked = !updatingItem.checked
        dispatch(actions.updateRoroadlist(updatingItem))
        updateRoroadListGQL({ variables: {
            id: item.id,
            checked: !item.checked,
        }})
    }

    return (
        <Button
            variant='contained'
            size='large'
            style={{
                position: 'relative',
                backgroundColor: backgroundColor,
                borderRadius: '5px',
                height: '100%',
                width: '100%',
                boxShadow: '2px 2px 6px',
                alignItems: 'flex-start',
                textTransform: 'none',
                padding: '0px 10px 0px 10px',
                border: isSelected ? '3px solid white' : null,
            }}
        >
            <Grid
                container
                fullWidth
                style={{
                    height: '100%',
                }}
            >
                <Grid item xs={2}
                    style={{
                        display: 'flex',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}
                    onClick={onCheckedClickHandler}
                >
                    {item.checked ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                </Grid>
                <Grid item xs={9}
                    style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}
                    onClick={onClickHandler}
                >
                    {item.name}
                </Grid>
                <Grid item xs={1}
                    style={{
                        display: 'flex',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}
                    onClick={onClickHandler}
                >
                    {typeIcon}
                </Grid>
            </Grid>
        </Button>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
})) (RoroadListItem)