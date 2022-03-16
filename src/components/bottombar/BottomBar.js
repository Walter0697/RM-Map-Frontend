import React, { useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import SearchIcon from '@mui/icons-material/Search'
import MapIcon from '@mui/icons-material/Map'
import HomeIcon from '@mui/icons-material/Home'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import SettingsIcon from '@mui/icons-material/Settings'

import HistoryIcon from '@mui/icons-material/History'
import TheatersIcon from '@mui/icons-material/Theaters'
import TrainIcon from '@mui/icons-material/Train'

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

    return (
        <div className={styles.bottomnav}>
             <div className={styles.bntab}>
                { location.pathname === '/movies' ? (
                    <SubBarIcon 
                        route={'/movies'}
                        parentRoute={'/search'}
                        path={location.pathname}
                        activeIcon={<TheatersIcon sx={{ color: activeColor }} fontSize='inherit' />}
                        setPath={changeTab}
                    />
                ) : (
                    <BarIcon
                        route={'/search'}
                        path={location.pathname}
                        activeIcon={<SearchIcon sx={{ color: activeColor }} fontSize='inherit' />}
                        inactiveIcon={<SearchIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                        setPath={changeTab}
                    />
                )}
            </div>
            <div className={styles.bntab}>
                { location.pathname === '/station' ? (
                    <SubBarIcon 
                        route={'/station'}
                        parentRoute={'/markers'}
                        path={location.pathname}
                        activeIcon={<TrainIcon sx={{ color: activeColor }} fontSize='inherit' />}
                        setPath={changeTab}
                    />
                ) : (
                    <BarIcon
                        route={'/markers'}
                        path={location.pathname}
                        activeIcon={<MapIcon sx={{ color: activeColor }} fontSize='inherit' />}
                        inactiveIcon={<MapIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                        setPath={changeTab}
                    />
                )}
                
            </div>
            <div className={styles.bntab}>
                { location.pathname === '/previous' ? (
                    <SubBarIcon 
                        route={'/previous'}
                        parentRoute={'/home'}
                        path={location.pathname}
                        activeIcon={<HistoryIcon sx={{ color: activeColor }} fontSize='inherit' />}
                        setPath={changeTab}
                    />
                ) : (
                    <BarIcon
                        route={'/home'}
                        path={location.pathname}
                        activeIcon={<HomeIcon sx={{ color: activeColor }} fontSize='inherit' />}
                        inactiveIcon={<HomeIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                        setPath={changeTab}
                    />
                )}
            </div>
            <div className={styles.bntab}>
                <BarIcon
                    route={'/schedule'}
                    path={location.pathname}
                    activeIcon={<CalendarTodayIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    inactiveIcon={<CalendarTodayIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            </div>
            <div className={styles.bntab}>
                <BarIcon
                    route={'/setting'}
                    path={location.pathname}
                    activeIcon={<SettingsIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    inactiveIcon={<SettingsIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            </div>
        </div>
    )
}

export default BottomBar