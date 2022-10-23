import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Base from './Base'

import { useLazyQuery } from '@apollo/client'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import RoroadListList from '../components/list/RoroadListList'
import RoroadListForm from '../components/form/RoroadListForm'

import AutoHideAlert from '../components/AutoHideAlert'

import graphql from '../graphql'

function RoroadListPage() {
    const history = useHistory()

    const [ isFormOpen, setFormOpen ] = useState(false)
    const [ edittingItem, setEdittingItem ] = useState(null)

    const openCreateForm = () => {
        setEdittingItem(null)
        setFormOpen(true)
    }

    const openEditForm = (item) => {
        setEdittingItem(item)
        setFormOpen(true)
    }

    const closeForm = () => {
        setEdittingItem(null)
        setFormOpen(false)
    }

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/home')}
                label='RoroadList'
            />
            <RoroadListList 
                openCreateForm={openCreateForm}
                openEditForm={openEditForm}
            />
            <RoroadListForm
                open={isFormOpen}
                handleClose={closeForm}
                updatingItem={edittingItem}
                onCreated={closeForm}
                onUpdated={closeForm}
            />
        </Base>
    )
}

export default connect(state => ({
    eventtypes: state.marker.eventtypes,
})) (RoroadListPage)