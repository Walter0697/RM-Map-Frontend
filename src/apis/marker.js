import request from './axios'
import generic from '../scripts/generic'

const list = () => request.credential(
    `query{
        markers {
          label
        }
    }`
)

const create = (
    label,
    type,
    latitude,
    longitude,
    address = '',
    link = '',
    image_link = '',
    description = '',
    to_time = null,
    from_time = null,
) => {
    const to = to_time ? generic.time.toRFC3339Format(to_time) : null
    const from = from_time ? generic.time.toRFC3339Format(from_time) : null

    return request.credential(
        `mutation{
            createMarker(input: {
                label: "${label}",
                type: "${type}",
                latitude: "${latitude}",
                longitude: "${longitude}",
                address: "${address}",
                link: "${link}",
                image_link: "${image_link}",
                description: "${description}",
                to_time: ${request.nullable(to)},
                from_time: ${request.nullable(from)},
            })
        }`
    )
}

const markers = {
    list,
    create,
}

export default markers