const defaultSettingKey = 'AppDefaultSetting'

const defaultState = {
    currentMap: {
        station: null,
        country: null,
    }
}

const changeCurrentMap = (field, value) => {
    const savedState = localStorage.getItem(defaultSettingKey)
    let currentState = defaultState
    if (savedState) {
        currentState = JSON.parse(savedState)
    }
    currentState.currentMap[field] = value
    localStorage.setItem(defaultSettingKey, JSON.stringify(currentState))
}

const getCurrentMap = (field) => {
    const savedState = localStorage.getItem(defaultSettingKey)
    let currentState = defaultState
    if (savedState) {
        currentState = JSON.parse(savedState)
    }
    return currentState.currentMap[field]
}

const storage = {
    changeCurrentMap,
    getCurrentMap,
}

export default storage