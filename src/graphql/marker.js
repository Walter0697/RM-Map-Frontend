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
            permanent
            need_booking
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
                          $permanent: Boolean,
                          $need_booking: Boolean,
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
            permanent: $permanent,
            need_booking: $need_booking,
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
            permanent
            need_booking
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
            permanent
            need_booking
            price
            status
            to_time
            from_time
            is_fav
            created_at
        }
    }
`

const edit = gql`
    mutation editMarkerGQL($id: Int!,
                        $label: String
                        $address: String
                        $image_link: String
                        $image_upload: Upload
                        $no_image: Boolean!
                        $link: String
                        $type: String
                        $description: String
                        $permanent: Boolean
                        $need_booking: Boolean
                        $to_time: String
                        $from_time: String
                        $estimate_time: String
                        $price: String) {
        editMarker(input: {
            id: $id,
            label: $label,
            address: $address,
            image_link: $image_link,
            image_upload: $image_upload,
            no_image: $no_image,
            link: $link,
            type: $type,
            description: $description,
            permanent: $permanent,
            need_booking: $need_booking,
            to_time: $to_time,
            from_time: $from_time,
            estimate_time: $estimate_time,
            price: $price,
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
            permanent
            need_booking
            price
            status
            to_time
            from_time
            is_fav
            created_at
        }
    }
`

// retrieving the marker after deleting the schedule
const remove = gql`
    mutation removeMarkerGQL($id: Int!) {
        removeMarker(input: {
            id: $id,
        }) 
    }
`

const markers = {
    list,
    create,
    update_fav,
    previous,
    revoke,
    edit,
    remove,
}

export default markers