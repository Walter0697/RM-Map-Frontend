import { gql } from '@apollo/client'

const list = gql`
    query listMovieGQL {
        movies {
            id
            reference_id
            label
            release_date
            image_path
            is_fav
        }
    }
`

const create = gql`
    mutation createFavMovieGQL($movie_rid: Int!) {
        createFavouriteMovie(input: {
            movie_rid: $movie_rid,
        }) { 
            id
            reference_id
            label
            release_date
            image_path
            is_fav
        }
    }
`

const remove = gql`
    mutation removeFavMovieGQL($id: Int!) {
        removeFavouriteMovie(input: {
            id: $id,
        })
    }
`

const search = gql`
    query moviefetchGQL($type: String!, 
                    $location: String,
                    $query: String) {
        moviefetch(filter: {
            type: $type,
            location: $location,
            query: $query,
        }) {
            ref_id
            title
            image_link
            release_date
        }
    }
`

const schedule = gql`
    mutation createMovieScheduleGQL($label: String!,
                                $description: String!,
                                $selected_time: String!,
                                $marker_id: Int,
                                $movie_rid: Int!) {
        createMovieSchedule(input: {
            label: $label,
            description: $description,
            selected_time: $selected_time,
            marker_id: $marker_id,
            movie_rid: $movie_rid,
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
    list,
    create,
    remove,
    search,
    schedule,
}

export default movies