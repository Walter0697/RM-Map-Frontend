import {
    ApolloClient,
    InMemoryCache,
    from,
  } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createUploadLink({
    uri: process.env.REACT_APP_GRAPHQL_BACKEND,
})

const authLink = setContext((_, { headers }) => {
    const state = localStorage.getItem('reduxState')
    let token = null
    if (state) {
        const json = JSON.parse(state)
        if (json.auth?.jwt) {
            token = json.auth.jwt
        }
    }
    
    return {
        headers: {
            ...headers,
            authorization: token ? token : '',
        }
    }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
    )

    if (networkError) console.log(`[Network error]: ${networkError}`)
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