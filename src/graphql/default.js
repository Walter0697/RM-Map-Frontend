import { gql } from '@apollo/client'

const pins = gql`
    query listDefaultPinsGQL{
        defaultpins {
            label
            pin {
                id
                label
                display_path
            }
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

const update_pin = gql`
    mutation updateDefaultPinGQL($label: String!,
                        $pin_id: Int!) {
        updateDefault(input: {
            label: $label,
            updated_type: "pin",
            int_value: $pin_id,
        })
    }
`

const defaults = {
    pins,
    update_pin,
}

export default defaults
  