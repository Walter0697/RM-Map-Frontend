import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { useLazyQuery } from '@apollo/client'

import Base from './Base'

import useBoop from '../hooks/useBoop'

import TopBar from '../components/topbar/TopBar'
import RoroadListList from '../components/list/RoroadListList'
import RoroadListViewForm from '../components/form/RoroadListViewForm'
import BottomSearchNameDisplay from '../components/wrapper/BottomSearchNameDisplay'
import AutoHideAlert from '../components/AutoHideAlert'

import graphql from '../graphql'
import RoroadListSearchForm from '../components/form/RoroadListSearchForm'

function PreviousRoroadListPage() {
    const history = useHistory()
    
    const [ successAlert, setSuccessAlert ] = useBoop(3000)
    const [ searchFail, setSearchFail ] = useBoop(3000)

    const [ isFormOpen, setFormOpen ] = useState(false)
    const [ viewingItem, setViewingItem ] = useState(null)

    const [ searchName, setSearchName ] = useState('')
    const [ isSearchFormOpen, setSearchFormOpen ] = useState(false)

    const [ searchRoroadListGQL, { data: searchData, loading: searchLoading, error: searchError } ] = useLazyQuery(graphql.roroadlists.search, { errorPolicy: 'all', fetchPolicy: 'no-cache' })
    
    useEffect(() => {
        fetchData()
    }, [])

    const searchedList = useMemo(() => {
        if (searchLoading) {
            return []
        }

        if (!searchData) {
            return []
        }

        const list = [ ...searchData.roroadlistsbyname ]
        return list
    }, [searchData, searchLoading])

    useEffect(() => {
        if (searchError) {
            setSearchFail()
        }
    }, [searchError])

    const fetchData = (name) => {
        const searchNameVar = name !== '' ? name : null
        searchRoroadListGQL({ variables: { hidden: true, name: searchNameVar }})
    }

    const openViewForm = (item) => {
        setFormOpen(true)
        setViewingItem(item)
    }

    const closeForm = () => {
        setFormOpen(false)
        setViewingItem(null)
    }

    const onUpdateHandler = () => {
        closeForm()
        setSuccessAlert()
        fetchData()
    }

    const onSearchNameSet = (name) => {
        setSearchFormOpen(false)
        setSearchName(name)
        fetchData(name)
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
                    label='Previous RoroadList'
                />
                <RoroadListList 
                    openCreateForm={null}
                    openEditForm={null}
                    openFilterForm={() => setSearchFormOpen(true)}
                    openViewForm={openViewForm}
                    roroadlists={searchedList}
                    isPrevious={true}
                />

                {/* form */}
                <RoroadListViewForm 
                    roroadlist={viewingItem}
                    open={isFormOpen}
                    onUpdated={onUpdateHandler}
                    onFailHandler={setSearchFail}
                    handleClose={closeForm}
                />
                <RoroadListSearchForm
                    open={isSearchFormOpen}
                    handleClose={() => setSearchFormOpen(false)}
                    searchName={searchName}
                    setSearchName={onSearchNameSet}
                />

                {searchName && (
                    <BottomSearchNameDisplay 
                        searchName={searchName}
                    />
                )}
            </div>

            {/* alert */}
            <AutoHideAlert 
                open={searchFail}
                type={'error'}
                message={'Fail to connect to server'}
                timing={3000}
            />
            <AutoHideAlert 
                open={successAlert}
                type={'success'}
                message={'Successfully updated'}
                timing={3000}
            />
        </Base>
    )
}

export default PreviousRoroadListPage