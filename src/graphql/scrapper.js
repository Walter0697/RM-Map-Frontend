import { gql } from '@apollo/client'

const scrap = gql`
    mutation websiteScrapGQL( $source: String!,
                    $source_id: String!) {
        websiteScrap(input: {
            source: $source,
            source_id: $source_id,
        }) {
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
`

const scrappers = {
    scrap,
}

export default scrappers