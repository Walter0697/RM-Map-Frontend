import React, { useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'

import { useLazyQuery } from '@apollo/client'

import dayjs from 'dayjs'

import RandomFadeIn from '../wrapper/RandomFadeIn'
import WrapperBox from '../wrapper/WrapperBox'
import TodaySchedule from './home/TodaySchedule'
import FeaturedMarkerRow from './home/FeaturedMarkerRow'
import YesterdayUncheckList from './home/YesterdayUncheckList'
import PreviousMarkerButton from './home/PreviousMarkerButton'

import markerhelper from '../../scripts/marker'
import filters from '../../scripts/filter'
import actions from '../../store/actions'
import graphql from '../../graphql'

function HomeList({
    yesterdaySchedules,
    setYesterdaySchedules,
    openYesterdayStatusForm,
    setSelectedMarker,
    markers,
    schedules,
    eventtypes,
    featured,
    updated_date,
    dispatch,
}) {
    const history = useHistory()

    // graphql request
    const [ getTodayGQL, { data: todayData, loading: todayLoading, error: todayError } ] = useLazyQuery(graphql.users.today, { fetchPolicy: 'no-cache' })

    const getFeaturedMarkers = (markers, eventtypes) => {
        const filtered_markers = markerhelper.find.suggest(markers, eventtypes)
        //const filtered_markers = markers.filter(s => s.status === '')
        const featured_list = markerhelper.find.feature_list(filtered_markers, [])

        const shuffle = featured_list.sort(() => Math.random() - 0.5)

        let featured = []
        let row = { left: null, right: null }

        const itemLength = shuffle.length >= 4 ? 4 : shuffle.length
        
        for (let i = 0; i < itemLength; i++) {
            if (!row.left) {
                row.left = shuffle[i]
            } else {
                row.right = shuffle[i]
                featured.push(row)
                row = { left: null, right: null }
            }
        }
        
        if (row.left) {
            featured.push(row)
        }
        
        return featured
    }

    // use memo
    const todayMarkersImage = useMemo(() => {
        if (!schedules) return []
        return filters.schedules.get_today_image(schedules, eventtypes)
    }, [schedules, eventtypes])

    const featuredMarkers = useMemo(() => {
        if (featured && dayjs().format('YYYY-MM-DD') === updated_date) {
            return featured
        } 

        if (!markers || (markers && markers.length === 0)) return []
        if (!eventtypes) return []
        const list = getFeaturedMarkers(markers, eventtypes)
        dispatch(actions.resetHomeFeatured(list))
        return list

    }, [featured, markers, eventtypes])

    useEffect(() => {
        getTodayGQL({ variables: { time: dayjs().format('YYYY-MM-DD') } })
    }, [])

    useEffect(() => {
        if (todayData) {
            let unfinished_event = []
            todayData.today.yesterday_event.forEach(event => {
                if (!event.status) {
                    unfinished_event.push(event)
                }
            })
            setYesterdaySchedules(unfinished_event)
        }
        
        if (todayError) {
            console.log(todayError)
        }
    }, [todayData, todayError])

    const onTodayScheduleClick = () => {
        history.replace('/schedule/open')
    }

    const onPreviousMarkerClick = () => {
        history.replace('/previous')
    }

    return (
        <>
            <div style={{
                position: 'absolute',
                height: '80%',
                width: '95%',
                paddingLeft: '5%',
                paddingTop: '20px',
                overflow: 'auto',
            }}>
                <RandomFadeIn>
                    {yesterdaySchedules && yesterdaySchedules.length !== 0 && (
                        <WrapperBox
                            height={40}
                            marginBottom={'15px'}
                        >
                            <YesterdayUncheckList
                                onClickHandler={openYesterdayStatusForm}
                            />
                        </WrapperBox>
                    )}
                    
                    {todayMarkersImage.length !== 0 && (
                        <WrapperBox
                            height={100}
                            marginBottom={'15px'}
                        >
                            <TodaySchedule 
                                list={todayMarkersImage}
                                onClickHandler={onTodayScheduleClick}
                            />
                        </WrapperBox>
                    )}
                    
                    {featuredMarkers.map((item, index) => (
                        <WrapperBox
                            height={250}
                            marginBottom={'20px'}
                            key={index}
                        >
                            <FeaturedMarkerRow
                                row={item}
                                onClickHandler={setSelectedMarker}
                                eventtypes={eventtypes}
                            />
                        </WrapperBox>
                    ))}
                    <WrapperBox
                        height={40}
                        marginBottom={'20px'}
                    >
                        <PreviousMarkerButton
                            onClickHandler={onPreviousMarkerClick}
                        />
                    </WrapperBox>
                </RandomFadeIn>
            </div>
        </>
    )
  }

  export default connect(state => ({
    markers: state.marker.markers,
    eventtypes: state.marker.eventtypes,
    schedules: state.schedule.schedules,
    featured: state.home.featured,
    updated_date: state.home.updated_date,
})) (HomeList)