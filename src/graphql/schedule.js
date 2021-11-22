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
            }
        }
    }
`

const create = gql`
    mutation createScheduleGQL( $label: String!,
                        $description: String!,
                        $selected_time: String!
                        $marker_id: Int!
                        ) {
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
            }
        }
    }
`

const schedules = {
    list,
    create,
    update_status,
}

export default schedules