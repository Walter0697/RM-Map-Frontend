import React from 'react'
import {
  Switch,
  Route,
} from 'react-router-dom' 

import '@tomtom-international/web-sdk-maps/dist/maps.css'

import Login from './pages/Login'
import Test from './pages/Test'
import SearchPage from './pages/SearchPage'

function App() {
  return (
      <Route render={({ location }) => (
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/search" component={SearchPage} />
          <Route path="/test2" component={Test} />
          <Route path="/test3" component={SearchPage} />
          <Route path="/test4" component={Test} />
          <Route path="/test5" component={Test} />
        </Switch>
      )} />
  )
}

export default App