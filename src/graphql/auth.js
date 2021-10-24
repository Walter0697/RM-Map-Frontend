
import { gql } from '@apollo/client'

const login = gql`
    mutation loginGQL($username: String!, $password: String!){
        login(input: { username: $username, password: $password}) {
            jwt
            username
        }
    }
`

const auth = {
    login,
}

export default auth