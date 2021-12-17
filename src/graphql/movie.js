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

const movies = {
    search,
}

export default movies