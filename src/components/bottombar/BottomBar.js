import React, { useRef, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import SearchIcon from '@mui/icons-material/Search'
import MapIcon from '@mui/icons-material/Map'
import HomeIcon from '@mui/icons-material/Home'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import SettingsIcon from '@mui/icons-material/Settings'

import AvTimerIcon from '@mui/icons-material/AvTimer'       // expired marker
import FlagIcon from '@mui/icons-material/Flag'             // previous marker
import TheatersIcon from '@mui/icons-material/Theaters'     // movie
import TrainIcon from '@mui/icons-material/Train'           // station
import FilterAltIcon from '@mui/icons-material/FilterAlt'   // filter

import BarIcon from './BarIcon'
import SubBarIcon from './SubBarIcon'

import constants from '../../constant'
import styles from '../../styles/bottom.module.css'

const inactiveColor = constants.colors.barInactiveColor
const activeColor = constants.colors.barActiveColor

function BottomBar({
    onChangeClick,
}) {
    const history = useHistory()
    const location = useLocation()
    const next = useRef(null)

    const changeTab = (tab) => {
        if (next.current === tab) return
        next.current = tab
        onChangeClick()
        window.setTimeout(() => {
            history.replace(next.current)
        }, 200)
    }

    const SearchButton = useMemo(() => {
        if (location.pathname === '/movies') {
            return (
                <SubBarIcon 
                    route={'/movies'}
                    parentRoute={'/search'}
                    path={location.pathname}
                    activeIcon={<TheatersIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            )
        }

        return (
            <BarIcon
                route={'/search'}
                path={location.pathname}
                activeIcon={<SearchIcon sx={{ color: activeColor }} fontSize='inherit' />}
                inactiveIcon={<SearchIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                setPath={changeTab}
            />
        )
    }, [location.pathname])

    const MarkerButton = useMemo(() => {
        if (location.pathname === '/station') {
            return (
                <SubBarIcon 
                    route={'/station'}
                    parentRoute={'/markers'}
                    path={location.pathname}
                    activeIcon={<TrainIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            )
        }

        if (location.pathname === '/filter') {
            return (
                <SubBarIcon 
                    route={'/filter'}
                    parentRoute={'/markers'}
                    path={location.pathname}
                    activeIcon={<FilterAltIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            )
        }

        return (
            <BarIcon
                route={'/markers'}
                path={location.pathname}
                activeIcon={<MapIcon sx={{ color: activeColor }} fontSize='inherit' />}
                inactiveIcon={<MapIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                setPath={changeTab}
            />
        )
    }, [location.pathname])

    const HomeButton = useMemo(() => {
        if (location.pathname === '/previous') {
            return (
                <SubBarIcon 
                    route={'/previous'}
                    parentRoute={'/home'}
                    path={location.pathname}
                    activeIcon={<FlagIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            )
        }
        if (location.pathname === '/expired') {
            return (
                <SubBarIcon 
                    route={'/expired'}
                    parentRoute={'/home'}
                    path={location.pathname}
                    activeIcon={<AvTimerIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            )
        }

        return (
            <BarIcon
                route={'/home'}
                path={location.pathname}
                activeIcon={<HomeIcon sx={{ color: activeColor }} fontSize='inherit' />}
                inactiveIcon={<HomeIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                setPath={changeTab}
            />
        )
    }, [location.pathname])

    const ScheduleButton = useMemo(() => {
        return (
            <BarIcon
                route={'/schedule'}
                path={location.pathname}
                activeIcon={<CalendarTodayIcon sx={{ color: activeColor }} fontSize='inherit' />}
                inactiveIcon={<CalendarTodayIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                setPath={changeTab}
            />
        )
    }, [])

    const SettingButton = useMemo(() => {
        return (
            <BarIcon
                route={'/setting'}
                path={location.pathname}
                activeIcon={<SettingsIcon sx={{ color: activeColor }} fontSize='inherit' />}
                inactiveIcon={<SettingsIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                setPath={changeTab}
            />
        )
    }, [])

    return (
        <div className={styles.bottomnav}>
             <div className={styles.bntab}>
                {SearchButton}
            </div>
            <div className={styles.bntab}>
                {MarkerButton}
            </div>
            <div className={styles.bntab}>
                {HomeButton}
            </div>
            <div className={styles.bntab}>
                {ScheduleButton}
            </div>
            <div className={styles.bntab}>
                {SettingButton}
            </div>
        </div>
    )
}

export default BottomBar