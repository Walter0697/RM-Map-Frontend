import React, { useEffect } from 'react'
import {
  Switch,
  Route,
} from 'react-router-dom' 

import '@tomtom-international/web-sdk-maps/dist/maps.css'

import Start from './pages/Start'
import Login from './pages/Login'
import SearchPage from './pages/SearchPage'
import MarkerPage from './pages/MarkerPage'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import SettingPage from './pages/SettingPage'

import PreviousMarkerPage from './pages/PreviousMarkerPage'
import MoviePage from './pages/MoviePage'
import StationPage from './pages/StationPage'

import TypeManage from './pages/admin/TypeManage'
import PinManage from './pages/admin/PinManage'
import DefaultPinManage from './pages/admin/DefaultPinManage'

import InitData from './InitData'

function App() {
  return (
      <>
        <Route render={({ location }) => (
          <Switch>
            <Route exact path='/' component={Start} />
            <Route path='/login' component={Login} />
            <Route path='/search' component={SearchPage} />
            <Route path='/markers' component={MarkerPage} />
            <Route path='/home' component={HomePage} />
            <Route path='/schedule' component={SchedulePage} />
            <Route path='/setting' component={SettingPage} />

            <Route path='/previous' component={PreviousMarkerPage} />
            <Route path='/movies' component={MoviePage} />
            <Route path='/station' component={StationPage} />

            <Route path='/admin/type' component={TypeManage} />
            <Route path='/admin/pin' component={PinManage} />
            <Route path='/admin/defaultpin' component={DefaultPinManage} />
          </Switch>
        )} />
        <InitData />
      </>
  )
}

export default App