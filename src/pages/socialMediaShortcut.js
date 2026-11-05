export const buildSocialMediaShortcutLaunchURL = (setupURL) => (
    `shortcuts://run-shortcut?name=${encodeURIComponent('Send To Tubemin')}&input=text&text=${encodeURIComponent(setupURL)}`
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

export const downloadSocialMediaShortcut = async (fetchImpl, downloadURL, jwt) => {
    const response = await fetchImpl(downloadURL, {
        method: 'GET',
        headers: { Authorization: jwt },
    })
    if (!response.ok) {
        throw new Error('Could not download the Roroadmap Shortcut.')
    }
    return response.blob()
}
