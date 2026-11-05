import {
    buildSocialMediaShortcutLaunchURL,
    requestSocialMediaShortcutSetup,
} from './socialMediaShortcut'

describe('social media Shortcut setup', () => {
    test('builds a URL-scheme launch with the one-time setup URL', () => {
        const launchURL = buildSocialMediaShortcutLaunchURL('https://api.example.test/api/shortcut/setup/token with spaces')

        expect(launchURL).toBe(
            'shortcuts://run-shortcut?name=Send%20To%20Tubemin&input=text&text=https%3A%2F%2Fapi.example.test%2Fapi%2Fshortcut%2Fsetup%2Ftoken%20with%20spaces',
        )
    })

    test('requests setup metadata with the authenticated session', async () => {
        const fetchImpl = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                setup_url: 'https://api.example.test/api/shortcut/setup/token',
                download_url: 'https://api.example.test/settings/ios-shortcut/download',
            }),
        }))

        await expect(requestSocialMediaShortcutSetup(fetchImpl, '/settings/ios-shortcut/setup', 'jwt-token'))
            .resolves.toEqual({
                setup_url: 'https://api.example.test/api/shortcut/setup/token',
                download_url: 'https://api.example.test/settings/ios-shortcut/download',
            })
        expect(fetchImpl).toHaveBeenCalledWith('/settings/ios-shortcut/setup', {
            method: 'POST',
            headers: { Authorization: 'jwt-token' },
        })
    })

    test('does not expose response details when setup fails', async () => {
        const fetchImpl = jest.fn(async () => ({ ok: false, status: 500, text: async () => 'secret api key' }))

        await expect(requestSocialMediaShortcutSetup(fetchImpl, '/settings/ios-shortcut/setup', 'jwt-token'))
            .rejects.toThrow('Could not prepare the Roroadmap Shortcut.')
    })
})
