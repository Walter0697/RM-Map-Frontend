import {
    ApolloClient,
    InMemoryCache,
    from,
  } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import backend from './constant/backend'
import store from './store'
import { handleTerminalUnauthorized } from './scripts/authSession'

const httpLink = createUploadLink({
    uri: backend.GRAPHQL_BACKEND,
})

const authLink = setContext((_, { headers }) => {
    let token = store.getState()?.auth?.jwt || ''

    if (!token) {
        const persistedAuth = localStorage.getItem('rm_auth')
        if (persistedAuth) {
            const json = JSON.parse(persistedAuth)
            token = json.jwt || ''
        }
    }

    if (!token) {
        const state = localStorage.getItem('reduxState')
        if (state) {
            const json = JSON.parse(state)
            token = json.auth?.jwt || ''
        }
    }

    return {
        headers: {
            ...headers,
            authorization: token || '',
        }
    }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
    const hasUnauthorizedGraphQLError = (graphQLErrors || []).some((error) => {
        const code = error?.extensions?.code
        const message = `${error?.message || ''}`.toLowerCase()

        return code === 'UNAUTHENTICATED'
            || code === 'FORBIDDEN'
            || message.includes('permission denied')
            || message.includes('unauthorized')
            || message.includes('unauthenticated')
    })

    const statusCode = networkError?.statusCode || networkError?.status || networkError?.response?.status
    const hasUnauthorizedNetworkError = statusCode === 401

    if (hasUnauthorizedGraphQLError || hasUnauthorizedNetworkError) {
        handleTerminalUnauthorized()
    }
})

const client = new ApolloClient({
    link: from([errorLink, authLink.concat(httpLink)]),
    cache: new InMemoryCache(),
})

export default client

//   const httpLink = createHttpLink({
//     uri: '/graphql',
//   });
  
//   const authLink = setContext((_, { headers }) => {
//     // get the authentication token from local storage if it exists
//     const token = localStorage.getItem('token');
//     // return the headers to the context so httpLink can read them
//     return {
//       headers: {
//         ...headers,
//         authorization: token ? `Bearer ${token}` : "",
//       }
//     }
//   });
  
//   const client = new ApolloClient({
//     link: authLink.concat(httpLink),
//     cac
