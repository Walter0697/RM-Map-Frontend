import { gql } from '@apollo/client'

const search = gql`
    query userSearchGQL($username: String!) {
        usersearch(filter: {
            username: $username,
        })
    }
`

const preference = gql`
    query getPreferenceGQL{
        preference {
            user {
                username
            }
            relation {
                username
            }
        }
    }
`

const users = {
    search,
    preference,
}

export default users