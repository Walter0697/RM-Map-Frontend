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

const getPersistedDeepLinkState = () => {
  const pending = readJSON(sessionStorage.getItem('rm_deeplink_intent'))
  if (!pending) return {}
  return {
    deepLink: {
      pending,
    },
  }
}

if (process.env.REACT_APP_ENV === 'development') {
  const persistedAuthState = getPersistedAuthState()
  const persistedDeepLinkState = getPersistedDeepLinkState()
  const devState = readJSON(localStorage.getItem('reduxState'), {})
  const defaultValues = {
    ...devState,
    ...persistedAuthState,
    ...persistedDeepLinkState,
  }

  const showDevTools = process.env.REACT_APP_ENV === 'development'
  && window.__REDUX_DEVTOOLS_EXTENSION__
  && window.__REDUX_DEVTOOLS_EXTENSION__()

  store = createStore(combinedReducers, defaultValues, showDevTools)
  store.subscribe(() => {
    localStorage.setItem('reduxState', JSON.stringify(store.getState()))
  })
} else {
  store = createStore(combinedReducers, {
    ...getPersistedAuthState(),
    ...getPersistedDeepLinkState(),
  })
}

store.subscribe(() => {
  const state = store.getState()
  const auth = state?.auth || { jwt: '', username: '' }
  localStorage.setItem('rm_auth', JSON.stringify({
    jwt: auth.jwt || '',
    username: auth.username || '',
  }))

  const pendingDeepLink = state?.deepLink?.pending || null
  if (pendingDeepLink) {
    sessionStorage.setItem('rm_deeplink_intent', JSON.stringify(pendingDeepLink))
  } else {
    sessionStorage.removeItem('rm_deeplink_intent')
  }
})

export default store
