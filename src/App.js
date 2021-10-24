import React from 'react'
import {
  Switch,
  Route,
} from 'react-router-dom' 

import '@tomtom-international/web-sdk-maps/dist/maps.css'

import Login from './pages/Login'
import Test from './pages/Test'
import SearchPage from './pages/SearchPage'
import HomePage from './pages/HomePage'
import SettingPage from './pages/SettingPage'

function App() {
  return (
      <Route render={({ location }) => (
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/search" component={SearchPage} />
          <Route path="/test2" component={Test} />
          <Route path="/home" component={HomePage} />
          <Route path="/test4" component={Test} />
          <Route path="/setting" component={SettingPage} />
        </Switch>
      )} />
  )
}

export default App