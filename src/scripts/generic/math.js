import _ from 'lodash'

const rand = (num) => {
    return Math.floor(Math.random() * num)
}

const nonRepeatNumber = (num, max) => {
    if (num >= max) return false
    let set = new Set()

    while (set.size < num) {
        const number = rand(max)
        set.add(number)
    }

    return set
}

const shuffleElement = (list, num) => {
    let current = _.cloneDeep(list)
    let targetNum = num
    if (list.length < num) targetNum = list.length

    const output = []
    while (output.length < targetNum) {
        const index = rand(current.length)
        output.push(current[index])
        current.splice(index, 1)
    }

    return output
}

const math = {
    rand,
    nonRepeatNumber,
    shuffleElement,
}

export default math