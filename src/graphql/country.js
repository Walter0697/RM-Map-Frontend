import { gql } from '@apollo/client'

const listCountryPoint = gql`
    query listCountryPointGQL{
        countrypoints{
            id
            label
            map_name
            photo_x
            photo_y
            map_x
            map_y
        }
    }
`

const listCountryLocation = gql`
    query listCountryLocationGQL{   
        countrylocations{
            id
            label
            country_point_id
            marker_id
            image_link
            visit_time
            marker {
                id
                type
                description
                latitude
                longitude
                label
                address
                link
                image_link
                estimate_time
                permanent
                need_booking
                price
                status
                country_code
                country_part
                to_time
                from_time
                is_fav
            }
        }
    }
`

const createCountryPoint = gql`
    mutation createCountryPointGQL($label: String!
                                $map_name: String!
                                $photo_x: Float!
                                $photo_y: Float!
                                $map_x: Float
                                $map_y: Float) {
        createCountryPoint(input: {
            label: $label,
            map_name: $map_name,
            photo_x: $photo_x,
            photo_y: $photo_y,
            map_x: $map_x,
            map_y: $map_y,
        }) {
            id
            label
            map_name
            photo_x
            photo_y
            map_x
            map_y
        }
    }
`

const createCountryLocation = gql`
    mutation createCountryLocationGQL($label: String!
                                    $country_point_id: Int!
                                    $marker_id: Int 
                                    $image_link: String, 
                                    $image_upload: Upload,
                                    $visit_time: String) {
        createCountryLocation(input: {
            label: $label,
            country_point_id: $country_point_id,
            marker_id: $marker_id,
            image_link: $image_link,
            image_upload: $image_upload,
            visit_time: $visit_time,
        }) {
            id
            label
            country_point_id
            marker_id
            image_link
            visit_time
            marker {
                id
                type
                description
                latitude
                longitude
                label
                address
                link
                image_link
                estimate_time
                permanent
                need_booking
                price
                status
                country_code
                country_part
                to_time
                from_time
                is_fav
            }
        }
    }
`

const country = {
    listCountryPoint,
    listCountryLocation,
    createCountryPoint,
    createCountryLocation,
}

export default country