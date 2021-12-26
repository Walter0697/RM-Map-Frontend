import { gql } from '@apollo/client'

const list = gql`
    query listReleaseNoteGQL {
        releasenotes {
            version
        }
    }
`

const latest = gql`
    query latestReleaseGQL {
        latestreleasenote {
            version
            notes
            date
        }
    }
`

const find = gql`
    query specificReleaseNoteGQL($version: String!) {
        specificreleasenote(filter: {
            version: $version,
        }) {
            version
            notes
            date
        }
    }
`

const releasenotes = {
    list,
    latest,
    find,
}

export default releasenotes