import { gql } from '@apollo/client'

const list = gql`
    query listMarkerGQL{
        markers{
            label
            address
            image_link
            type
            estimate_time
            price
            status
            to_time
            from_time
        }
    }
`

const listmap = gql`
    query listMapMarkerGQL{
        markers{
            id
            type
            latitude
            longitude
            to_time
        }
    }
`

const create = gql`
    mutation createMarkerGQL($label: String!, 
                          $type: String!,
                          $latitude: Float!, 
                          $longitude: Float!, 
                          $address: String!, 
                          $link: String, 
                          $image_link: String, 
                          $image_upload: Upload,
                          $description: String, 
                          $estimate_time: String,
                          $price: String,
                          $to_time: String, 
                          $from_time: String) {
        createMarker(input: {
            label: $label,
            type: $type,
            latitude: $latitude,
            longitude: $longitude,
            address: $address,
            link: $link,
            image_link: $image_link,
            image_upload: $image_upload,
            description: $description,
            estimate_time: $estimate_time,
            price: $price,
            to_time: $to_time,
            from_time: $from_time,
        })
    }
`

const markers = {
    list,
    listmap,
    create,
}

export default markers