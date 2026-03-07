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
                    easy_threshold_minutes: 20,
                    difficult_threshold_minutes: 45,
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
                    easy_threshold_minutes: 18,
                    difficult_threshold_minutes: 42,
                }),
            })

        const { container } = createRenderedPage()
        await act(async () => {
            await flushPromises()
        })

        expect(document.body.textContent).toContain('Configured')
        const input = container.querySelector('input[placeholder=\"https://www.icloud.com/shortcuts/...\"]')
        expect(input).toBeTruthy()
        expect(input.value).toBe('https://www.icloud.com/shortcuts/old')
        const easyInput = container.querySelector('input[placeholder=\"20\"]')
        const difficultInput = container.querySelector('input[placeholder=\"45\"]')
        expect(easyInput.value).toBe('20')
        expect(difficultInput.value).toBe('45')

        act(() => {
            setInputValue(input, 'https://www.icloud.com/shortcuts/new')
            setInputValue(easyInput, '18')
            setInputValue(difficultInput, '42')
        })
        clickByText(container, 'button', 'Save', true)

        await act(async () => {
            await flushPromises()
        })

        const shortcutSaveCall = global.fetch.mock.calls[2]
        expect(shortcutSaveCall[0]).toContain('/admin/settings/ios-shortcut-install-url')
        expect(shortcutSaveCall[1].method).toBe('PUT')
        expect(shortcutSaveCall[1].body).toContain('https://www.icloud.com/shortcuts/new')

        const thresholdSaveCall = global.fetch.mock.calls[3]
        expect(thresholdSaveCall[0]).toContain('/admin/settings/schedule-travel-thresholds')
        expect(thresholdSaveCall[1].method).toBe('PUT')
        expect(thresholdSaveCall[1].body).toContain('"easy_threshold_minutes":18')
        expect(thresholdSaveCall[1].body).toContain('"difficult_threshold_minutes":42')

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
                    easy_threshold_minutes: 20,
                    difficult_threshold_minutes: 45,
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
                    easy_threshold_minutes: 20,
                    difficult_threshold_minutes: 45,
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
