import { gql } from '@apollo/client'

const list = gql`
    query listStationGQL{
        stations{
            identifier
            label
            local_name
            photo_x
            photo_y
            map_x
            map_y
            active
            map_name
            line_info
        }
    }
`

const update_active = gql`
    mutation updateStationGQL($identifier: String!,
                        $map_name: String!,
                        $active: Boolean!) {
        updateStation(input: {
            identifier: $identifier,
            map_name: $map_name,
            active: $active,
        }) {
            identifier
            label
            local_name
            photo_x
            photo_y
            map_x
            map_y
            active
            map_name
            line_info
        }
    }
`

const stations = {
    list,
    update_active,
}

export default stations