export const buildSocialMediaShortcutLaunchURL = (setupURL) => (
    `shortcuts://run-shortcut?name=${encodeURIComponent('Roroadmap Analyze')}&input=text&text=${encodeURIComponent(setupURL)}`
)

export const requestSocialMediaShortcutSetup = async (fetchImpl, setupURL, jwt) => {
    const response = await fetchImpl(setupURL, {
        method: 'POST',
        headers: { Authorization: jwt },
    })
    if (!response.ok) {
        throw new Error('Could not prepare the Roroadmap Shortcut.')
    }
    return response.json()
}

export const getSocialMediaShortcutSetupURL = async (fetchImpl, setupURL, jwt, cachedSetupURL = '') => {
    if (cachedSetupURL) return cachedSetupURL

    const setup = await requestSocialMediaShortcutSetup(fetchImpl, setupURL, jwt)
    if (!setup?.setup_url) {
        throw new Error('Shortcut configuration URL was not returned.')
    }
    return setup.setup_url
}
