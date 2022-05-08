import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'

import TopBar from '../components/topbar/TopBar'
import FilterList from '../components/list/FilterList'
import Base from './Base'

import search from '../scripts/search'

import actions from '../store/actions'

function MarkerFilterPage({
    markers,
    dispatch,
}) {
    const history = useHistory()
    const location = useLocation()
    const suffix = location.pathname.replace('/filter', '')

    const getBackPagePath = () => {
        if (suffix === '/expired' || suffix === '/previous') {
            return suffix
        }
        return '/markers' + suffix
    }

    const back_path = getBackPagePath()

    const updateHashtag = () => {
        let hashTagList = {}
        markers.forEach(marker => {
            const currentHashtag = search.hashtag.check(marker.description)
            currentHashtag.forEach(tag => {
                if (hashTagList[tag]) {
                    hashTagList[tag] += 1
                } else {
                    hashTagList[tag] = 1
                }
            })
        })
        dispatch(actions.updateHashtag(hashTagList))
    }

    useEffect(() => {
        updateHashtag()
    }, [markers])
    
    return (
        <Base>
            <TopBar
                onBackHandler={() => history.replace(back_path)}
                label='Marker Filter'
            />
            <FilterList
                height={'80%'}
            />
        </Base>
    )
}

export default connect(state => ({
    markers: state.marker.markers,
})) (MarkerFilterPage)