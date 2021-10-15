import request from './axios'

const login = (username, password) => request.public(
    `mutation{
        login(input: { username: "${username}", password: "${password}" })
    }`, 
)

const auth = {
    login,
}

export default auth