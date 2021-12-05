import { gql } from '@apollo/client'

const webscrap = gql`
    query scrapimageGQL($link: String!) {
        scrapimage(params: {
            link: $link,
        }) {
            image_link
            title
        }
    }
`

const helpers = {
    webscrap,
}

export default helpers