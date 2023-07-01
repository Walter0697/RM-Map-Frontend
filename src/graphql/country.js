// countrypoints: [CountryPoint]!
//   countrylocations: [CountryLocation]!

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
                                    $image_upload: Upload
                                    $visit_time: String) {
        createCountryLocation(input: {
            label: $label,
            country_point_id: $country_point_id,
            marker_id: $marker_id,
            image_upload: $image_upload,
            visit_time: $visit_time,
        }) {
            id
            label
            country_point_id
            marker_id
            image_link
            visit_time
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