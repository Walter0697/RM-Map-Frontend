import { gql } from '@apollo/client'

const select = gql`
    query listEventTypeGQL {
        eventtypes {
            label
            value
            priority
            icon_path
            hidden
        }
    }
`

const list = gql`
    query listMarkerTypeGQL{
        markertypes {
            id
            label
            value
            priority
            icon_path
            hidden
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

const previewList = gql`
    query listTypePreviewGQL{
        markertypes{
            id
            label
        }
    }
`

const create = gql`
    mutation createMarkerTypeGQL($label: String!,
                            $value: String!,
                            $priority: Int!,
                            $icon_upload: Upload
                            $hidden: Boolean!) {
        createMarkerType(input: {
            label: $label,
            value: $value,
            priority: $priority,
            icon_upload: $icon_upload,
            hidden: $hidden,
        }) {
            id
        }
    }
`

const edit = gql`
    mutation editMarkerTypeGQL($id: Int!,
                            $label: String,
                            $value: String,
                            $priority: Int,
                            $icon_upload: Upload,
                            $hidden: Boolean,) {
        editMarkerType(input: {
            id: $id,
            label: $label,
            value: $value,
            priority: $priority,
            icon_upload: $icon_upload
            hidden: $hidden
        }) {
            id
        }
    }
`

const remove = gql`
    mutation removeMarkerTypeGQL($id: Int!) {
        removeMarkerType(input: {
            id: $id,
        }) 
    }
`

const markertypes = {
    select,
    list,
    create,
    edit,
    remove,
    preview_list: previewList,
}

export default markertypes