import React from 'react'
import {
  Switch,
  Route,
} from 'react-router-dom' 

import '@tomtom-international/web-sdk-maps/dist/maps.css'

import Start from './pages/Start'
import Login from './pages/Login'
import OIDCLoginPage from './pages/OIDCLoginPage'
import SearchPage from './pages/SearchPage'
import MarkerPage from './pages/MarkerPage'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import SettingPage from './pages/SettingPage'
import TravelPlansPage from './pages/TravelPlansPage'
import RecipesPage from './pages/RecipesPage'

import PreviousMarkerPage from './pages/PreviousMarkerPage'
import ExpiredMarkerPage from './pages/ExpiredMarkerPage'
import MoviePage from './pages/MoviePage'
import FavouriteMoviePage from './pages/FavouriteMoviePage'
import StationPage from './pages/StationPage'
import CountryPage from './pages/CountryPage'
import WatchedMoviePage from './pages/WatchedMoviePage'

import MarkerFilterPage from './pages/MarkerFilterPage'

import TypeManage from './pages/admin/TypeManage'
import PinManage from './pages/admin/PinManage'
import PinGroupManage from './pages/admin/PinGroupManage'
import DefaultPinManage from './pages/admin/DefaultPinManage'
import ApiKeyManage from './pages/admin/ApiKeyManage'
import TrainStationManage from './pages/admin/TrainStationManage'
import PermanentCleanupManage from './pages/admin/PermanentCleanupManage'
import ExternalAPIUsageManage from './pages/admin/ExternalAPIUsageManage'
import SystemSettingsManage from './pages/admin/SystemSettingsManage'
import ReleaseNotesManage from './pages/admin/ReleaseNotesManage'

import InitData from './InitData'

function App() {
  return (
      <>
        <Route render={() => (
          <Switch>
            <Route exact path='/' component={Start} />
            <Route exact path='/login/oidc' component={OIDCLoginPage} />
            <Route path='/login' component={Login} />
            <Route path='/search' component={SearchPage} />
            <Route exact path='/marker/:marker_id' component={MarkerPage} />
            <Route exact path='/markers/:marker_id' component={MarkerPage} />
            <Route path='/markers' component={MarkerPage} />
            <Route path='/home' component={HomePage} />
            <Route exact path='/schedules/:schedule_id' component={SchedulePage} />
            <Route path='/schedule' component={SchedulePage} />
            <Route path='/setting' component={SettingPage} />
            <Route path='/travel-plans' component={TravelPlansPage} />
            <Route path='/recipes' component={RecipesPage} />

            <Route path='/previous' component={PreviousMarkerPage} />
            <Route path='/expired' component={ExpiredMarkerPage} />
            <Route path='/movies' component={MoviePage} />
            <Route path='/favmovies' component={FavouriteMoviePage} />
            <Route path='/station' component={StationPage} />
            <Route path='/country' component={CountryPage} />
            <Route path='/watchedmovies' component={WatchedMoviePage} />

            <Route path='/filter' component={MarkerFilterPage} />

            <Route path='/admin/type' component={TypeManage} />
            <Route path='/admin/pin-groups' component={PinGroupManage} />
            <Route exact path='/admin/pin' component={PinManage} />
            <Route path='/admin/defaultpin' component={DefaultPinManage} />
            <Route path='/admin/apikey' component={ApiKeyManage} />
            <Route path='/admin/station/:mapName?' component={TrainStationManage} />
            <Route path='/admin/cleanup' component={PermanentCleanupManage} />
            <Route path='/admin/api-usage' component={ExternalAPIUsageManage} />
            <Route path='/admin/system-settings' component={SystemSettingsManage} />
            <Route path='/admin/release-notes' component={ReleaseNotesManage} />
          </Switch>
        )} />
        <InitData />
      </>
  )
}

export default App
