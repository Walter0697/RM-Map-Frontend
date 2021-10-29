import { gql } from '@apollo/client'

const list = gql`
    query listMarkerTypeGQL{
        markertypes {
            id
            label
            value
            priority
            icon_path
            created_at
            created_by {
                id
                username
            }
            updated_at
            updated_by {
                id
                username
            }
        }
    }
`

const create = gql`
    mutation createMarkerTypeGQL($label: String!,
                            $value: String!,
                            $priority: Int!,
                            $icon_upload: Upload) {
        createMarkerType(input: {
            label: $label,
            value: $value,
            priority: $priority,
            icon_upload: $icon_upload,
        }) {
            id
        }
    }
`

const markertypes = {
    list,
    create,
}

export default markertypes