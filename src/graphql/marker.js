import { gql } from '@apollo/client'

const list = gql`
    query listMarkerGQL{
        markers{
            label
        }
    }
`

const create = gql`
    mutation createMarkerGQL($label: String!, 
                          $type: String!,
                          $latitude: String!, 
                          $longitude: String!, 
                          $address: String!, 
                          $link: String, 
                          $image_link: String, 
                          $image_upload: Upload,
                          $description: String, 
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
            to_time: $to_time,
            from_time: $from_time,
        })
    }
`

const markers = {
    list,
    create,
}

export default markers