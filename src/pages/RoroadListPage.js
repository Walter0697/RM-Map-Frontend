import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import Base from './Base'

import TopBar from '../components/topbar/TopBar'
import RoroadListList from '../components/list/RoroadListList'
import RoroadListForm from '../components/form/RoroadListForm'

function RoroadListPage({
    roroadlists,
}) {
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
            <div
                style={{
                    width: '100%',
                    height: '90%',
                    position: 'relative',
                }}
            >
                <TopBar
                    onBackHandler={() => history.replace('/home')}
                    label='RoroadList'
                />
                <RoroadListList 
                    openCreateForm={openCreateForm}
                    openEditForm={openEditForm}
                    roroadlists={roroadlists}
                />
                <RoroadListForm
                    open={isFormOpen}
                    handleClose={closeForm}
                    updatingItem={edittingItem}
                    onCreated={closeForm}
                    onUpdated={closeForm}
                />
            </div>
        </Base>
    )
}

export default connect(state => ({
    roroadlists: state.roroadlist.roroadlists,
})) (RoroadListPage)