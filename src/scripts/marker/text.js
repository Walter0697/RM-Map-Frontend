import generic from '../generic'

const featuredText = { 
    'upcoming': [
        'it\' about to end!',
        'ending soon!',
        'dont\' miss this!',
    ],
    'longtime': [
        'did you forget this?',
        'once upon a time~',
        'is it still here?',
    ],
    'lucky': [
        'feeling lucky?',
        'today\'s pick!',
        'wanna try this?',
    ],
    'shorttime': [
        'not enough time?',
        'won\'t spend much time!',
        'an hour or so~',
    ],
    'restaurant': [
        'eat something tasty!',
        'finger lickin\' good!',
        'EAT EAT EAT!',
    ],
    'expensive': [
        'got some extra cash?',
        'feeling rich today~',
        'expensive but worth it!',
    ],
}


const pickRandomFeaturedText = (type) => {
    const list = featuredText[type]
    if (list) {
        const index = generic.math.rand(list.length)
        return list[index]
    }
    return ''
}

const text = {
    feature_text: pickRandomFeaturedText,
}

export default text