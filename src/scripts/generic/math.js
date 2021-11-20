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

const math = {
    rand,
    nonRepeatNumber,
}

export default math