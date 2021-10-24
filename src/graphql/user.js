import { gql } from '@apollo/client'

const search = gql`
    query userSearchGQL($username: String!) {
        usersearch(filter: {
            username: $username,
        }) {
            username
        }
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

const update_relation = gql`
    mutation updateRelationGQL($username: String!) {
        updateRelation(input: {
            username: $username,
        })
    }
` 

const users = {
    search,
    preference,
    update_relation,
}

export default users