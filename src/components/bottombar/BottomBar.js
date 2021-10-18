import React, { useRef } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import SearchIcon from '@mui/icons-material/Search'
import MapIcon from '@mui/icons-material/Map'
import HomeIcon from '@mui/icons-material/Home'
import StarIcon from '@mui/icons-material/Star'
import SettingsIcon from '@mui/icons-material/Settings'

import BarIcon from './BarIcon'

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
                <BarIcon
                    route={'/search'}
                    path={location.pathname}
                    activeIcon={<SearchIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    inactiveIcon={<SearchIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            </div>
            <div className={styles.bntab}>
                <BarIcon
                    route={'/test2'}
                    path={location.pathname}
                    activeIcon={<MapIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    inactiveIcon={<MapIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            </div>
            <div className={styles.bntab}>
                <BarIcon
                    route={'/test3'}
                    path={location.pathname}
                    activeIcon={<HomeIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    inactiveIcon={<HomeIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            </div>
            <div className={styles.bntab}>
                <BarIcon
                    route={'/test4'}
                    path={location.pathname}
                    activeIcon={<StarIcon sx={{ color: activeColor }} fontSize='inherit' />}
                    inactiveIcon={<StarIcon sx={{ color: inactiveColor }} fontSize='inherit' />}
                    setPath={changeTab}
                />
            </div>
            <div className={styles.bntab}>
                <BarIcon
                    route={'/test5'}
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