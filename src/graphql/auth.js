
import { gql } from '@apollo/client'

const login = gql`
    mutation loginGQL($username: String!, $password: String!){
        login(input: { username: $username, password: $password }) {
            jwt
            username
        }
    }
`

const logout = gql`
    mutation logoutGQL($jwt: String!) {
        logout(input: { jwt: $jwt }) 
    }
`

const me = gql`
    query meGQL{
        me
    }
`

const auth = {
    login,
    logout,
    me,
}

export default auth