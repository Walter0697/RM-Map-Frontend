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
            regular_pin {
                label
                display_path
            }
            favourite_pin {
                label
                display_path
            }
            schedule_pin {
                label
                display_path
            }
            hurry_pin {
                label
                display_path
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