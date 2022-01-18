import { gql } from '@apollo/client'

const list = gql`
    query listScheduleGQL($time: String!) {
        schedules(params: {
            time: $time,
        }) {
            id
            label
            description
            status
            selected_date
            marker {
                id
                label
                latitude
                longitude
                address
                image_link
                link
                type
                restaurant {
                    id
                    name
                    source
                    source_id
                    price_range
                    restaurant_type
                    address
                    rating
                    direction
                    telephone
                    introduction
                    opening_hours
                    payment_method
                    seat_number
                    website
                    other_info
                }
            }
            movie {
                id
                label
                release_date
                image_path
            }
        }
    }
`

const create = gql`
    mutation createScheduleGQL( $label: String!,
                        $description: String!,
                        $selected_time: String!,
                        $marker_id: Int!) {
        createSchedule(input: {
            label: $label,
            description: $description,
            selected_time: $selected_time,
            marker_id: $marker_id,
        }) {
            id
            label
            description
            status
            selected_date
            marker {
                id
                label
                latitude
                longitude
                address
                image_link
                status
                link
                type
                restaurant {
                    id
                    name
                    source
                    source_id
                    price_range
                    restaurant_type
                    address
                    rating
                    direction
                    telephone
                    introduction
                    opening_hours
                    payment_method
                    seat_number
                    website
                    other_info
                }
            }
        }
    }
`

const update_status = gql`
    mutation updateScheduleStatusGQL($input: [ScheduleStatus]!) {
        updateScheduleStatus(input: {
            ids: $input,
        }) {
            id
            label
            description
            status
            selected_date
            marker {
                id
                label
                latitude
                longitude
                address
                image_link
                status
                link
                type
                restaurant {
                    id
                    name
                    source
                    source_id
                    price_range
                    restaurant_type
                    address
                    rating
                    direction
                    telephone
                    introduction
                    opening_hours
                    payment_method
                    seat_number
                    website
                    other_info
                }
            }
            movie {
                id
                label
                release_date
                image_path
            }
        }
    }
`

const by_marker = gql`
    query listMarkerScheduleGQL($id: Int!) {
        markerschedules(params: {
            id: $id,
        }) {
            id
            label
            description
            status
            selected_date
        }
    }
`

const edit = gql`
    mutation editScheduleGQL($id: Int!,
                            $label: String,
                            $description: String,
                            $selected_time: String) {
        editSchedule(input: {
            id: $id,
            label: $label
            description: $description
            selected_time: $selected_time
        }) {
            id
            label
            description
            status
            selected_date
            marker {
                id
                label
                latitude
                longitude
                address
                image_link
                status
                link
                type
                restaurant {
                    id
                    name
                    source
                    source_id
                    price_range
                    restaurant_type
                    address
                    rating
                    direction
                    telephone
                    introduction
                    opening_hours
                    payment_method
                    seat_number
                    website
                    other_info
                }
            }
            movie {
                id
                label
                release_date
                image_path
            }
        }
    }
`

// retrieving the marker after deleting the schedule
const remove = gql`
    mutation removeScheduleGQL($id: Int!) {
        removeSchedule(input: {
            id: $id,
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

const schedules = {
    list,
    create,
    update_status,
    by_marker,
    edit,
    remove,
}

export default schedules