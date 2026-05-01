import React, { useRef, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import CottageRoundedIcon from '@mui/icons-material/CottageRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded'

import LocalMoviesRoundedIcon from '@mui/icons-material/LocalMoviesRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'

import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import FlagRoundedIcon from '@mui/icons-material/FlagRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import ConnectingAirportsRoundedIcon from '@mui/icons-material/ConnectingAirportsRounded'

import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import TrainRoundedIcon from '@mui/icons-material/TrainRounded'

import BarIcon from './BarIcon'
import SubBarIcon from './SubBarIcon'
import styles from '../../styles/bottom.module.css'

const tabPalette = {
    search: {
        activeColor: '#ffffff',
        activeBackgroundColor: '#f97316',
        inactiveColor: '#c2410c',
        inactiveBackgroundColor: '#ffedd5',
    },
    marker: {
        activeColor: '#ffffff',
        activeBackgroundColor: '#0f766e',
        inactiveColor: '#0f766e',
        inactiveBackgroundColor: '#ccfbf1',
    },
    home: {
        activeColor: '#ffffff',
        activeBackgroundColor: '#2563eb',
        inactiveColor: '#1d4ed8',
        inactiveBackgroundColor: '#dbeafe',
    },
    schedule: {
        activeColor: '#ffffff',
        activeBackgroundColor: '#7c3aed',
        inactiveColor: '#6d28d9',
        inactiveBackgroundColor: '#ede9fe',
    },
    setting: {
        activeColor: '#ffffff',
        activeBackgroundColor: '#db2777',
        inactiveColor: '#be185d',
        inactiveBackgroundColor: '#fce7f3',
    },
}

const renderIcon = (IconComponent, color) => (
    <IconComponent sx={{ color }} fontSize='inherit' />
)

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
                    activeIcon={renderIcon(LocalMoviesRoundedIcon, tabPalette.search.activeColor)}
                    activeBackgroundColor={tabPalette.search.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }
        if (location.pathname === '/favmovies') {
            return (
                <SubBarIcon 
                    route={'/favmovies'}
                    parentRoute={'/search'}
                    path={location.pathname}
                    activeIcon={renderIcon(FavoriteRoundedIcon, tabPalette.search.activeColor)}
                    activeBackgroundColor={tabPalette.search.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }

        return (
            <BarIcon
                route={'/search'}
                path={location.pathname}
                activeIcon={renderIcon(SearchRoundedIcon, tabPalette.search.activeColor)}
                inactiveIcon={renderIcon(SearchRoundedIcon, tabPalette.search.inactiveColor)}
                activeBackgroundColor={tabPalette.search.activeBackgroundColor}
                inactiveBackgroundColor={tabPalette.search.inactiveBackgroundColor}
                setPath={changeTab}
            />
        )
    }, [location.pathname])

    const MarkerButton = useMemo(() => {
        if (location.pathname === '/filter/list' || location.pathname === '/filter/map') {
            return (
                <SubBarIcon 
                    route={'/filter'}
                    parentRoute={'/markers'}
                    path={location.pathname}
                    activeIcon={renderIcon(TuneRoundedIcon, tabPalette.marker.activeColor)}
                    activeBackgroundColor={tabPalette.marker.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }

        return (
            <BarIcon
                route={'/markers'}
                path={location.pathname}
                activeIcon={renderIcon(ExploreRoundedIcon, tabPalette.marker.activeColor)}
                inactiveIcon={renderIcon(ExploreRoundedIcon, tabPalette.marker.inactiveColor)}
                activeBackgroundColor={tabPalette.marker.activeBackgroundColor}
                inactiveBackgroundColor={tabPalette.marker.inactiveBackgroundColor}
                setPath={changeTab}
            />
        )
    }, [location.pathname])

    const HomeButton = useMemo(() => {
        if (location.pathname === '/station') {
            return (
                <SubBarIcon 
                    route={'/station'}
                    parentRoute={'/home'}
                    path={location.pathname}
                    activeIcon={renderIcon(TrainRoundedIcon, tabPalette.home.activeColor)}
                    activeBackgroundColor={tabPalette.home.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }
        if (location.pathname === '/country') {
            return (
                <SubBarIcon 
                    route={'/country'}
                    parentRoute={'/home'}
                    path={location.pathname}
                    activeIcon={renderIcon(PublicRoundedIcon, tabPalette.home.activeColor)}
                    activeBackgroundColor={tabPalette.home.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }
        return (
            <BarIcon
                route={'/home'}
                path={location.pathname}
                activeIcon={renderIcon(CottageRoundedIcon, tabPalette.home.activeColor)}
                inactiveIcon={renderIcon(CottageRoundedIcon, tabPalette.home.inactiveColor)}
                activeBackgroundColor={tabPalette.home.activeBackgroundColor}
                inactiveBackgroundColor={tabPalette.home.inactiveBackgroundColor}
                setPath={changeTab}
            />
        )
    }, [location.pathname])

    const ScheduleButton = useMemo(() => {
        return (
            <BarIcon
                route={'/schedule'}
                path={location.pathname}
                activeIcon={renderIcon(EventRoundedIcon, tabPalette.schedule.activeColor)}
                inactiveIcon={renderIcon(EventRoundedIcon, tabPalette.schedule.inactiveColor)}
                activeBackgroundColor={tabPalette.schedule.activeBackgroundColor}
                inactiveBackgroundColor={tabPalette.schedule.inactiveBackgroundColor}
                setPath={changeTab}
            />
        )
    }, [location.pathname])

    const SettingButton = useMemo(() => {
        if (location.pathname === '/previous') {
            return (
                <SubBarIcon 
                    route={'/previous'}
                    parentRoute={'/setting'}
                    path={location.pathname}
                    activeIcon={renderIcon(FlagRoundedIcon, tabPalette.setting.activeColor)}
                    activeBackgroundColor={tabPalette.setting.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }
        if (location.pathname === '/filter/previous') {
            return (
                <SubBarIcon 
                    route={'/filter'}
                    parentRoute={'/previous'}
                    path={location.pathname}
                    activeIcon={renderIcon(TuneRoundedIcon, tabPalette.setting.activeColor)}
                    activeBackgroundColor={tabPalette.setting.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }
        if (location.pathname === '/expired') {
            return (
                <SubBarIcon 
                    route={'/expired'}
                    parentRoute={'/setting'}
                    path={location.pathname}
                    activeIcon={renderIcon(HourglassTopRoundedIcon, tabPalette.setting.activeColor)}
                    activeBackgroundColor={tabPalette.setting.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }
        if (location.pathname === '/filter/expired') {
            return (
                <SubBarIcon 
                    route={'/filter'}
                    parentRoute={'/expired'}
                    path={location.pathname}
                    activeIcon={renderIcon(TuneRoundedIcon, tabPalette.setting.activeColor)}
                    activeBackgroundColor={tabPalette.setting.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }
        if (location.pathname === '/watchedmovies') {
            return (
                <SubBarIcon 
                    route={'/watchedmovies'}
                    parentRoute={'/setting'}
                    path={location.pathname}
                    activeIcon={renderIcon(HistoryRoundedIcon, tabPalette.setting.activeColor)}
                    activeBackgroundColor={tabPalette.setting.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }
        if (location.pathname === '/travel-plans') {
            return (
                <SubBarIcon
                    route={'/travel-plans'}
                    parentRoute={'/setting'}
                    path={location.pathname}
                    activeIcon={renderIcon(ConnectingAirportsRoundedIcon, tabPalette.setting.activeColor)}
                    activeBackgroundColor={tabPalette.setting.activeBackgroundColor}
                    setPath={changeTab}
                />
            )
        }

        return (
            <BarIcon
                route={'/setting'}
                path={location.pathname}
                activeIcon={renderIcon(PaletteRoundedIcon, tabPalette.setting.activeColor)}
                inactiveIcon={renderIcon(PaletteRoundedIcon, tabPalette.setting.inactiveColor)}
                activeBackgroundColor={tabPalette.setting.activeBackgroundColor}
                inactiveBackgroundColor={tabPalette.setting.inactiveBackgroundColor}
                setPath={changeTab}
            />
        )
    }, [location.pathname])

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
