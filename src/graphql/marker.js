import { gql } from '@apollo/client'

const list = gql`
    query listMarkerGQL{
        markers{
            id
            type
            description
            latitude
            longitude
            label
            address
            link
            image_link
            type
            estimate_time
            price
            status
            to_time
            from_time
            is_fav
            created_at
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
        }) {
            id
            type
            description
            latitude
            longitude
            label
            address
            image_link
            type
            estimate_time
            price
            status
            to_time
            from_time
            is_fav
        }
    }
`

const update_fav = gql`
    mutation updateMarkerFavouriteGQL($id: Int!,
                                    $is_fav: Boolean!) {
        updateMarkerFav(input: {
            id: $id,
            is_fav: $is_fav,
        }) {
            id
            is_fav
        }
    }
`

const previous = gql`
    query previousMarkerGQL{
        previousmarkers{
            id
            type
            description
            latitude
            longitude
            label
            address
            link
            image_link
            type
            estimate_time
            price
            status
            to_time
            from_time
            is_fav
            created_at
        }
    }
`

const revoke = gql`
    mutation revokeMarkerGQL($id: Int!) {
        revokeMarker(input: {
            id: $id,
        }) {
            id
            type
            description
            latitude
            longitude
            label
            address
            link
            image_link
            type
            estimate_time
            price
            status
            to_time
            from_time
            is_fav
            created_at
        }
    }
`

const markers = {
    list,
    create,
    update_fav,
    previous,
    revoke,
}

export default markers