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
    const extractReasonFromText = (text) => {
        const source = `${text || ''}`
        const match = source.match(/invalid token:\s*([a-z0-9_:-]+)/i)
        if (!match || !match[1]) return ''
        return match[1].toLowerCase()
    }

    const reasonToMessage = (reason) => {
        const code = `${reason || ''}`.toLowerCase()
        if (!code) return 'Your session expired or was revoked. Please log in again.'
        if (code === 'jwt_parse_failed') return 'Session ended (`jwt_parse_failed`). Please log in again.'
        if (code === 'auth_state_mismatch') return 'Session ended (`auth_state_mismatch`). Please log in again.'
        if (code === 'auth_state_error') return 'Session ended (`auth_state_error`). Please log in again.'
        if (code === 'user_not_found') return 'Session ended (`user_not_found`). Please log in again.'
        if (code === 'user_lookup_failed') return 'Session ended (`user_lookup_failed`). Please log in again.'
        if (code === 'missing_user_context') return 'Session ended (`missing_user_context`). Please log in again.'
        if (code === 'user_inactive') return 'Session ended (`user_inactive`). Please contact an admin.'
        return `Session ended (\`${code}\`). Please log in again.`
    }

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
        const graphMessage = (graphQLErrors || []).map((error) => `${error?.message || ''}`).join(' ')
        const networkMessage = `${networkError?.message || ''}`
        const headerReason = networkError?.response?.headers?.get?.('X-RM-Auth-Reason')
            || networkError?.response?.headers?.get?.('x-rm-auth-reason')
            || ''
        const reason = (headerReason || extractReasonFromText(graphMessage) || extractReasonFromText(networkMessage) || '').toLowerCase()
        handleTerminalUnauthorized({ message: reasonToMessage(reason) })
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
