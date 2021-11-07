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
                id
                label
                display_path
            }
            favourite_pin {
                id
                label
                display_path
            }
            selected_pin {
                id
                label
                display_path
            }
            hurry_pin {
                id
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

const update_pin = gql`
    mutation updatePreferredPinGQL($label: String!,
                                $pin_id: Int!) {
        updatePreferredPin(input: {
            label: $label,
            pin_id: $pin_id,
        }) {
            regular_pin {
                id
                label
                display_path
            }
            favourite_pin {
                id
                label
                display_path
            }
            selected_pin {
                id
                label
                display_path
            }
            hurry_pin {
                id
                label
                display_path
            }
        }
    }
`

const users = {
    search,
    preference,
    update_relation,
    update_pin,
}

export default users