import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

import SystemSettingsManage from './SystemSettingsManage'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function rootReducer(state = { auth: { jwt: 'test-jwt', username: 'admin' } }) {
    return state
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

function setInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
}

function clickByText(container, tag, text, exact = false) {
    const candidates = Array.from(container.querySelectorAll(tag))
    const found = candidates.find((item) => {
        const content = (item.textContent || '').trim()
        return exact ? content === text : content.includes(text)
    })
    if (!found) {
        throw new Error(`cannot find ${tag} with text: ${text}`)
    }
    act(() => {
        found.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
}

function createRenderedPage() {
    const store = configureStore({ reducer: rootReducer })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
        root.render(
            <Provider store={store}>
                <MemoryRouter>
                    <SystemSettingsManage />
                </MemoryRouter>
            </Provider>
        )
    })

    return { container, root }
}

describe('SystemSettingsManage', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
        document.body.innerHTML = ''
    })

    test('loads configured shortcut URL and saves updates', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ios_shortcut_install_url: 'https://www.icloud.com/shortcuts/old',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    telegram_bot_url: 'https://t.me/roroadbot',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    easy_threshold_minutes: 20,
                    difficult_threshold_minutes: 45,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    short_minutes: 30,
                    medium_minutes: 60,
                    long_minutes: 120,
                    auto_minutes: 30,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ios_shortcut_install_url: 'https://www.icloud.com/shortcuts/new',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    telegram_bot_url: 'https://t.me/new_roroadbot',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    easy_threshold_minutes: 18,
                    difficult_threshold_minutes: 42,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    short_minutes: 35,
                    medium_minutes: 70,
                    long_minutes: 150,
                    auto_minutes: 30,
                }),
            })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('Configured')
        const input = container.querySelector('input[placeholder=\"https://www.icloud.com/shortcuts/...\"]')
        const telegramInput = container.querySelector('input[placeholder=\"roroadbot or https://t.me/roroadbot\"]')
        expect(input).toBeTruthy()
        expect(telegramInput).toBeTruthy()
        expect(input.value).toBe('https://www.icloud.com/shortcuts/old')
        expect(telegramInput.value).toBe('https://t.me/roroadbot')
        const easyInput = container.querySelector('input[placeholder=\"20\"]')
        const difficultInput = container.querySelector('input[placeholder=\"45\"]')
        const shortInput = container.querySelector('input[placeholder=\"30\"]')
        const mediumInput = container.querySelector('input[placeholder=\"60\"]')
        const longInput = container.querySelector('input[placeholder=\"120\"]')
        const autoInput = container.querySelectorAll('input[placeholder=\"30\"]')[1]
        expect(easyInput.value).toBe('20')
        expect(difficultInput.value).toBe('45')
        expect(shortInput.value).toBe('30')
        expect(mediumInput.value).toBe('60')
        expect(longInput.value).toBe('120')
        expect(autoInput.value).toBe('30')

        act(() => {
            setInputValue(input, 'https://www.icloud.com/shortcuts/new')
            setInputValue(telegramInput, 'https://t.me/new_roroadbot')
            setInputValue(easyInput, '18')
            setInputValue(difficultInput, '42')
            setInputValue(shortInput, '35')
            setInputValue(mediumInput, '70')
            setInputValue(longInput, '150')
            setInputValue(autoInput, '30')
        })
        clickByText(container, 'button', 'Save', true)

        await act(async () => {
            await flushPromises()
        })

        const shortcutSaveCall = global.fetch.mock.calls[4]
        expect(shortcutSaveCall[0]).toContain('/admin/settings/ios-shortcut-install-url')
        expect(shortcutSaveCall[1].method).toBe('PUT')
        expect(shortcutSaveCall[1].body).toContain('https://www.icloud.com/shortcuts/new')

        const telegramSaveCall = global.fetch.mock.calls[5]
        expect(telegramSaveCall[0]).toContain('/admin/settings/telegram-bot-url')
        expect(telegramSaveCall[1].method).toBe('PUT')
        expect(telegramSaveCall[1].body).toContain('https://t.me/new_roroadbot')

        const thresholdSaveCall = global.fetch.mock.calls[6]
        expect(thresholdSaveCall[0]).toContain('/admin/settings/schedule-travel-thresholds')
        expect(thresholdSaveCall[1].method).toBe('PUT')
        expect(thresholdSaveCall[1].body).toContain('"easy_threshold_minutes":18')
        expect(thresholdSaveCall[1].body).toContain('"difficult_threshold_minutes":42')

        const durationSaveCall = global.fetch.mock.calls[7]
        expect(durationSaveCall[0]).toContain('/admin/settings/calendar-sync-durations')
        expect(durationSaveCall[1].method).toBe('PUT')
        expect(durationSaveCall[1].body).toContain('"short_minutes":35')
        expect(durationSaveCall[1].body).toContain('"medium_minutes":70')
        expect(durationSaveCall[1].body).toContain('"long_minutes":150')
        expect(durationSaveCall[1].body).toContain('"auto_minutes":30')

        expect(document.body.textContent).toContain('Saved system settings.')
    })

    test('shows backend validation error when save fails', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ios_shortcut_install_url: '',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    telegram_bot_url: '',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    easy_threshold_minutes: 20,
                    difficult_threshold_minutes: 45,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    short_minutes: 30,
                    medium_minutes: 60,
                    long_minutes: 120,
                    auto_minutes: 30,
                }),
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => 'ios_shortcut_install_url must be a valid absolute http or https URL',
            })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        const input = container.querySelector('input[placeholder=\"https://www.icloud.com/shortcuts/...\"]')
        act(() => {
            setInputValue(input, 'https://example.com/shortcut')
        })
        clickByText(container, 'button', 'Save', true)

        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('ios_shortcut_install_url must be a valid absolute http or https URL')
    })

    test('disables save when thresholds are invalid', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    ios_shortcut_install_url: '',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    telegram_bot_url: '',
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    easy_threshold_minutes: 20,
                    difficult_threshold_minutes: 45,
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    short_minutes: 30,
                    medium_minutes: 60,
                    long_minutes: 120,
                    auto_minutes: 30,
                }),
            })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        const easyInput = container.querySelector('input[placeholder=\"20\"]')
        const difficultInput = container.querySelector('input[placeholder=\"45\"]')
        act(() => {
            setInputValue(easyInput, '60')
            setInputValue(difficultInput, '45')
        })

        const saveButton = Array.from(container.querySelectorAll('button')).find((button) => (button.textContent || '').trim() === 'Save')
        expect(saveButton).toBeTruthy()
        expect(saveButton.disabled).toBe(true)
        expect(document.body.textContent).toContain('Invalid thresholds')
    })
})
