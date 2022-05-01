import React, { useState, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'

import TopBar from '../components/topbar/TopBar'
import FilterList from '../components/list/FilterList'
import Base from './Base'

function MarkerFilterPage() {
    const history = useHistory()
    const location = useLocation()
    const suffix = location.pathname.replace('/filter', '')

    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/markers' + suffix)}
                label='Marker Filter'
            />
            <FilterList
                height={'90%'}
            />
        </Base>
    )
}

export default MarkerFilterPage