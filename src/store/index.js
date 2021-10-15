import { combineReducers } from '@reduxjs/toolkit'
import { createStore } from 'redux'
import reducers from './reducers'

const combinedReducers = combineReducers(reducers)
let store

if (process.env.REACT_APP_ENV === 'development') {
  const defaultValues = (() => {
    if (localStorage.getItem('reduxState')) {
      return JSON.parse(localStorage.getItem('reduxState'))
    }

    return {}
  })()

  const showDevTools = process.env.REACT_APP_ENV === 'development'
  && window.__REDUX_DEVTOOLS_EXTENSION__
  && window.__REDUX_DEVTOOLS_EXTENSION__()

  store = createStore(combinedReducers, defaultValues, showDevTools)
  store.subscribe(() => {
    localStorage.setItem('reduxState', JSON.stringify(store.getState()))
  })
} else {
  store = createStore(combinedReducers)
}

export default store