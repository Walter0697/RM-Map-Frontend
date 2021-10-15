import request from './axios'

const list = () => request.credential(
    `query{
        markers {
          label
        }
    }`
)

const markers = {
    list,
}

export default markers