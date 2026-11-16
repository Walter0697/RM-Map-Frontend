import {
    buildSocialMediaShortcutLaunchURL,
    getSocialMediaShortcutSetupURL,
    requestSocialMediaShortcutSetup,
} from './socialMediaShortcut'

describe('social media Shortcut setup', () => {
    test('builds the one-time configuration launch URL with the final shortcut name', () => {
        expect(buildSocialMediaShortcutLaunchURL('http://host/api/shortcut/setup/token')).toBe(
            'shortcuts://run-shortcut?name=Roroadmap%20Analyze&input=text&text=http%3A%2F%2Fhost%2Fapi%2Fshortcut%2Fsetup%2Ftoken',
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

    test('requests a fresh setup URL when no cached URL is available', async () => {
        const fetchImpl = jest.fn(async () => ({
            ok: true,
            json: async () => ({ setup_url: 'https://api.example.test/api/shortcut/setup/fresh-token' }),
        }))

        await expect(getSocialMediaShortcutSetupURL(
            fetchImpl,
            '/settings/ios-shortcut/setup',
            'jwt-token',
            '',
        )).resolves.toBe('https://api.example.test/api/shortcut/setup/fresh-token')
    })
})
