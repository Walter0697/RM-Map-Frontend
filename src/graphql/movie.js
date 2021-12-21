import { gql } from '@apollo/client'

const search = gql`
    query moviefetchGQL($type: String!, 
                    $location: String,
                    $query: String) {
        moviefetch(filter: {
            type: $type,
            location: $location,
            query: $query,
        }) {
            title
            image_link
            release_date
        }
    }
`

const create = gql`
    mutation createMovieScheduleGQL($label: String!,
                                $description: String!,
                                $selected_time: String!,
                                $marker_id: Int,
                                $movie_name: String!,
                                $movie_release: String,
                                $movie_image: String,) {
        createMovieSchedule(input: {
            label: $label,
            description: $description,
            selected_time: $selected_time,
            marker_id: $marker_id,
            movie_name: $movie_name,
            movie_release: $movie_release,
            movie_image: $movie_image,
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
            movie {
                id
                label
                release_date
                image_path
            }
        }
    }
`

const movies = {
    search,
    create,
}

export default movies