import React, { useEffect } from 'react'
import {
  Switch,
  Route,
} from 'react-router-dom' 

import '@tomtom-international/web-sdk-maps/dist/maps.css'

import Login from './pages/Login'
import Test from './pages/Test'
import SearchPage from './pages/SearchPage'
import MarkerPage from './pages/MarkerPage'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import SettingPage from './pages/SettingPage'

import InitData from './InitData'

function App() {
  return (
      <>
        <Route render={({ location }) => (
          <Switch>
            <Route exact path="/" component={Login} />
            <Route path="/search" component={SearchPage} />
            <Route path="/markers" component={MarkerPage} />
            <Route path="/home" component={HomePage} />
            <Route path="/schedule" component={SchedulePage} />
            <Route path="/setting" component={SettingPage} />
          </Switch>
        )} />
        <InitData />
      </>
  )
}

export default App