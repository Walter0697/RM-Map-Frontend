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

const today = gql`
    query getTodayGQL($time: String!) {
        today(params: {
            time: $time,
        }) {
            yesterday_event {
                id
                label
                description
                status
                selected_date
                marker {
                    id
                    label
                    latitude
                    longitude
                    address
                    image_link
                    link
                    type
                }
                movie {
                    id
                    label
                    release_date
                    image_path
                }
            }
        }
    }
`

const users = {
    search,
    preference,
    update_relation,
    update_pin,
    today,
}

export default users