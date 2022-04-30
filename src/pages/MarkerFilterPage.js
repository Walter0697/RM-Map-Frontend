import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'

import TopBar from '../components/topbar/TopBar'
import FilterList from '../components/list/FilterList'
import Base from './Base'

function MarkerFilterPage() {
    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace('/markers')}
                label='Marker Filter'
            />
            <FilterList
                height={'90%'}
            />
        </Base>
    )
}

export default MarkerFilterPage