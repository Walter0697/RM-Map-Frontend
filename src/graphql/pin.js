import { gql } from '@apollo/client'

const preview = gql`
    mutation previewPinGQL($top_left_x: Int!,
                        $top_left_y: Int!,
                        $bottom_right_x: Int!,
                        $bottom_right_y: Int!,
                        $image_upload: Upload
                        $type_id: Int!) {
        previewPin(input: {
            top_left_x: $top_left_x,
            top_left_y: $top_left_y,
            bottom_right_x: $bottom_right_x,
            bottom_right_y: $bottom_right_y,
            image_upload: $image_upload,
            type_id: $type_id,
        }) 
    }
`

const list = gql`
    query listPinGQL{
        pins {
            id
            label
            image_path
            top_left_x
            top_left_y
            bottom_right_x
            bottom_right_y
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
    mutation createPinGQL($label: String!,
                    $top_left_x: Int!,
                    $top_left_y: Int!,
                    $bottom_right_x: Int!,
                    $bottom_right_y: Int!,
                    $image_upload: Upload) {
        createPin(input: {
            label: $label,
            top_left_x: $top_left_x,
            top_left_y: $top_left_y,
            bottom_right_x: $bottom_right_x,
            bottom_right_y: $bottom_right_y,
            image_upload: $image_upload,
        }) {
            id
        }
    }
`

const edit = gql`
    mutation editPinGQL($id: Int!,
                    $label: String,
                    $top_left_x: Int,
                    $top_left_y: Int,
                    $bottom_right_x: Int,
                    $bottom_right_y: Int,
                    $image_upload: Upload) {
        editPin(input: {
            id: $id,
            label: $label,
            top_left_x: $top_left_x,
            top_left_y: $top_left_y,
            bottom_right_x: $bottom_right_x,
            bottom_right_y: $bottom_right_y,
            image_upload: $image_upload,
        }) {
            id
        }
    }
`

const remove = gql`
    mutation removePinGQL($id: Int!) {
        removePin(input: {
            id: $id,
        }) 
    }
`

const pins = {
    preview,
    list,
    create,
    edit,
    remove,
}

export default pins