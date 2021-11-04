import React, { useEffect } from 'react'
import {
  Switch,
  Route,
} from 'react-router-dom' 

import '@tomtom-international/web-sdk-maps/dist/maps.css'

import Login from './pages/Login'
import SearchPage from './pages/SearchPage'
import MarkerPage from './pages/MarkerPage'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import SettingPage from './pages/SettingPage'

import TypeManage from './pages/admin/TypeManage'
import PinManage from './pages/admin/PinManage'

import InitData from './InitData'

function App() {
  return (
      <>
        <Route render={({ location }) => (
          <Switch>
            <Route exact path='/' component={Login} />
            <Route path='/search' component={SearchPage} />
            <Route path='/markers' component={MarkerPage} />
            <Route path='/home' component={HomePage} />
            <Route path='/schedule' component={SchedulePage} />
            <Route path='/setting' component={SettingPage} />

            <Route path='/admin/type' component={TypeManage} />
            <Route path='/admin/pin' component={PinManage} />
          </Switch>
        )} />
        <InitData />
      </>
  )
}

export default App