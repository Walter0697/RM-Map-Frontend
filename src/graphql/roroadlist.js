import { gql } from '@apollo/client'

const list = gql`
    query listRoroadListGQL{
        roroadlists{
            id
            name
            list_type
            checked
            target_user
        }
    }
`

const search = gql`
    query searchRoroadListGQL($name: String, $hidden: Boolean) {
        roroadlistsbyname(params: {
            name: $name,
            hidden: $hidden,
        }){
            id
            name
            list_type
            checked
            target_user
            hidden
        }
    }
`

const create = gql`
    mutation createRoroadListGQL(
        $name: String!
        $target_user: String!
        $list_type: String!
    ) {
        createRoroadList(input: {
            name: $name,
            target_user: $target_user,
            list_type: $list_type,
        }) {
            id
            name
            list_type
            checked
            target_user
        }
    }
`

const edit = gql`
    mutation updateRoroadListGQL(
        $id: Int!
        $name: String
        $list_type: String
        $checked: Boolean
        $hidden: Boolean
        $target_user: String
    ) {
        updateRoroadList(input: {
            id: $id,
            name: $name,
            target_user: $target_user,
            list_type: $list_type,
            checked: $checked,
            hidden: $hidden,
        }) {
            id
            name
            list_type
            hidden
            checked
            target_user
        }
    }
`

const manage_multiple = gql`
    mutation manageRoroadListsGQL(
        $ids: [Int]!
        $hidden: Boolean
    ) {
        manageMultipleRoroadList(input: {
            ids: $ids,
            hidden: $hidden
        }) {
            id
            name
            list_type
            hidden
            checked
            target_user
        }
    }
`


const roroadlist = {
    list,
    search,
    create,
    edit,
    manage_multiple,
}

export default roroadlist