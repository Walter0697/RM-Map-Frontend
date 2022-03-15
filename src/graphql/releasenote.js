import { gql } from '@apollo/client'

const list = gql`
    query listReleaseNoteGQL {
        releasenotes {
            version
            icon
        }
    }
`

const latest = gql`
    query latestReleaseGQL {
        latestreleasenote {
            version
            notes
            date
            icon
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
            icon
        }
    }
`

const releasenotes = {
    list,
    latest,
    find,
}

export default releasenotes