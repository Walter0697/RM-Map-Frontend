import { combineReducers } from '@reduxjs/toolkit'
import { createStore } from 'redux'
import reducers from './reducers'

const combinedReducers = combineReducers(reducers)
let store

const readJSON = (value, fallback = null) => {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch (e) {
    return fallback
  }
}

const getPersistedAuthState = () => {
  const auth = readJSON(localStorage.getItem('rm_auth'))
  if (!auth) return {}
  return {
    auth: {
      jwt: auth.jwt || '',
      username: auth.username || '',
    },
  }
}

if (process.env.REACT_APP_ENV === 'development') {
  const persistedAuthState = getPersistedAuthState()
  const devState = readJSON(localStorage.getItem('reduxState'), {})
  const defaultValues = {
    ...devState,
    ...persistedAuthState,
  }

  const showDevTools = process.env.REACT_APP_ENV === 'development'
  && window.__REDUX_DEVTOOLS_EXTENSION__
  && window.__REDUX_DEVTOOLS_EXTENSION__()

  store = createStore(combinedReducers, defaultValues, showDevTools)
  store.subscribe(() => {
    localStorage.setItem('reduxState', JSON.stringify(store.getState()))
  })
} else {
  store = createStore(combinedReducers, getPersistedAuthState())
}

store.subscribe(() => {
  const state = store.getState()
  const auth = state?.auth || { jwt: '', username: '' }
  localStorage.setItem('rm_auth', JSON.stringify({
    jwt: auth.jwt || '',
    username: auth.username || '',
  }))
})

export default store
